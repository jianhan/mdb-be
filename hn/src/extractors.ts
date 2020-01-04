import cheerio from "cheerio";
import _ = require("lodash");
import R from "ramda";
import {Logger} from "winston";
import {logIdentity} from "./logger";

/**
 * tagsExtractor is entry point to extract all tags from html page.
 *
 * @param html
 * @param logger
 */
export const tagsExtractor = (html: string, logger: Logger): string[] => {
    const debug = R.curry(logIdentity)(logger);
    const extractor = R.compose(
        R.partial(convertHrefsToTags, [debug]),
        R.partial(filterInvalidHrefs, [debug]),
        sortAndUniqHrefs,
        extractHrefs,
    );

    return extractor(cheerio.load(html)("a.tag").toArray()) as string[];
};

/**
 *  convertHrefsToTags converts a list of hrefs to tag string.
 *
 * @param debug
 * @param hrefs
 */
const convertHrefsToTags = (debug: any, hrefs: string[]): string[] => {
    const converter = R.curry(R.map)(R.compose(hrefToTag, debug("debug")("convert href to tag")));
    return converter(hrefs) as string[];
};

/**
 * filterInvalidHrefs removes invalid format or pattern of href which can be transform into tags.
 * @param debug
 * @param hrefs
 */
const filterInvalidHrefs = (debug: any, hrefs: string[]): string[] => {
    const filter = R.curry(R.filter)(R.compose(isValidTaggedHref, debug("debug")("filter invalid hrefs")));
    // @ts-ignore
    return filter(hrefs) as string[];
};

/**
 * sortAndUniqHrefs sorts and removes duplicates from list.
 * @param data
 */
const sortAndUniqHrefs = (data: string[]): string[] => _.sortBy(_.uniq(data));

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
