import {Page} from "puppeteer";

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
        return scrape(
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
