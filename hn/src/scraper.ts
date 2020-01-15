import puppeteer, {LaunchOptions, Page} from "puppeteer";

type scrapeFunc = (url: string, page: Page) => any;

export const scraper = async (url: string, fn: scrapeFunc, options: LaunchOptions = {headless: true}) => {

    // initialize puppeteer
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // start to recursively retrieve tags.
    const result = await fn(url, page);
    await browser.close();
    return result;
};
