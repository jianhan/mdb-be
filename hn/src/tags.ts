import cheerio from "cheerio";
import _ = require("lodash");
import R from "ramda";
import {Logger} from "winston";

/**
 * tagsExtractor is entry point to extract all tags from html page.
 *
 * @param html
 * @param logger
 */
export const tagsExtractor = (html: string, logger: Logger): string[] => {
    logger.info("start process tagsExtractor");
    const hrefs = extractHrefs(cheerio.load(html)("a.tag").toArray());

    const composer  = R.compose(
        R.map(hrefToTag),
        R.uniq,
        R.sort((a: string, b: string) => a.localeCompare(b)),
        R.tap(x => logger.debug(`after isValidTaggedHref ${x}`)),
        // @ts-ignore
        R.filter(isValidTaggedHref),

    );

    return composer(hrefs);
};

/**
 * extractHrefs extracts hrefs from html string.
 * @param elements
 */
const extractHrefs = (elements: CheerioElement[]): string[] => {
    return _.reduce(elements, (accumulator: string[], current: CheerioElement) => {
        accumulator.push(_.get(current, "attribs[href]"));
        return accumulator;
    }, []);
};

/**
 * isValidTaggedHref validate if an given href is a valid tagged href.
 * @param href
 */
const isValidTaggedHref = (href: string): boolean => (new RegExp("(.*)tagged\\/(.+)$")).test(href);

/**
 * hrefToTag converts an href string into tag.
 * @param href
 */
const hrefToTag = (href: string): string =>  _.last(_.uniq(_.split(href, "/"))) as string;
