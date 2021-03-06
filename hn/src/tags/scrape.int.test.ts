import {Map} from "immutable";
import {Logger} from "winston";
import {Environment, LogLevel} from "../constants";
import {getEnvs} from "../envs";
import {createLogger} from "../logger";
import { scraper } from "../scraper";
import {extract} from "./extract";
import {scrape, scrapeTagsAndUpload} from "./scrape";
import Tag from "./Tag";

jest.setTimeout(30000);

let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
});

describe("scrape function", () => {

    it("should scrape all pages",  async () => {
        let errs = null;
        try {
            const result = await scraper("https://hackernoon.com/tagged/?page=9", scrape);
            expect(result.scrapedUrls).toContain("https://hackernoon.com/tagged/?page=9");
            expect(result.scrapedUrls).toContain("https://hackernoon.com/tagged/?page=10");
            expect(result.accumulatedHtml).not.toBe("");
            expect(result.nextPageUrl).toBe(false);
        } catch (e) {
            errs = e;
        }

        expect(errs).toBe(null);
    });

    it("should bail and throw error when invalid url was given",  () => {
        return scraper("invalid url", scrape).catch(e => expect(e).toBeInstanceOf(Error));
    });

    it("should scrape and get all tags",  async () => {
        let errs = null;
        try {
            const result = await scraper("https://hackernoon.com/tagged/?page=10", scrape);
            const tags = extract(result.accumulatedHtml, logger);
            expect(tags).not.toBe([]);
            expect(tags.filter((tag: Tag) => tag.count === 0)).toHaveLength(0);
        } catch (e) {
            errs = e;
        }

        expect(errs).toBe(null);
    });

});

describe("scrapeTagsAndUpload function", () => {
    it("should scrape tags and upload",  done => {
        scrapeTagsAndUpload(envs, logger, 1).subscribe(r => done());
    });
});
