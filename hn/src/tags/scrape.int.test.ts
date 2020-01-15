import { scraper } from "../scraper";
import {scrape} from "./scrape";

jest.setTimeout(20000);

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

});

describe("scrape and upload to s3", () => {
    it("should scrape tags and upload to s3");
});
