import {S3} from "aws-sdk";
import {Map} from "immutable";
import moment from "moment";
import {Page} from "puppeteer";
import R from "ramda";
import {from, Observable} from "rxjs";
import {flatMap, map} from "rxjs/operators";
import {Logger} from "winston";
import {scraper} from "../scraper";
import {extract} from "./extract";
import Tag from "./Tag";
import {prefixDateTime, uploadTags} from "./upload";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;

/**
 * ITagPageScrapeReturnVal contains return value for each iteration of
 * recursively calls of function scrape.
 */
export interface ITagPageScrapeReturnVal {
    accumulatedHtml: string;
    nextPageUrl: string | null | boolean;
    scrapedUrls: string[];
}

/**
 * scrape is a recursively called function to scrape all pages which contain tags, and return
 * the html format of each page alone with other meta data.
 *
 * @param url
 * @param page
 * @param accumulatedHtml
 * @param scrapedUrls
 */
export const scrape = async (
    url: string,
    page: Page,
    accumulatedHtml: string = "",
    scrapedUrls: string[] = [],
): Promise<ITagPageScrapeReturnVal> => {
    await page.goto(url);
    await page.waitFor(1000);
    await page.waitForSelector("div#pagination");

    /* istanbul ignore next */
    const result = await page.evaluate((h: string, u: string, sus: string): ITagPageScrapeReturnVal => {
        const nextPageLink = document.querySelector(`a[aria-label="Next"]`);
        return {
            accumulatedHtml: h.concat(document.body.innerHTML),
            nextPageUrl: nextPageLink !== null ? nextPageLink.getAttribute("href") : false,
            scrapedUrls: [...sus, u],
        };
    }, accumulatedHtml, url, scrapedUrls);

    // if there is next page url available
    if (result.nextPageUrl !== false) {
        return await scrape(
            result.nextPageUrl as string,
            page,
            result.accumulatedHtml,
            result.scrapedUrls,
        );
    }

    // if there is no next page url available
    return {
        accumulatedHtml: result.accumulatedHtml,
        nextPageUrl: false,
        scrapedUrls: result.scrapedUrls,
    };
};

export const scrapeTagsAndUpload = (envs: Map<string, string | undefined>, logger: Logger, startingPage: number = 1): Observable<SendData> => {

    const s3 = new S3({
        accessKeyId: envs.get("S3_ACCESS_KEY_ID"),
        secretAccessKey: envs.get("S3_SECRET_ACCESS_KEY"),
    });
    const extractTags = R.partialRight(extract, [logger]);
    const fileName = prefixDateTime("YYYY-MM-DD-HH:mm")("tags.json", moment());

    return from(scraper("https://hackernoon.com/tagged/?page=" + startingPage, scrape)).pipe(
        map((r: ITagPageScrapeReturnVal) => {
            console.log(r.scrapedUrls);
            return extractTags(r.accumulatedHtml);
        }),
        flatMap((ts: Tag[]) => uploadTags(fileName, envs, s3, ts)),
    );
};
