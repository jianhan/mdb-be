import cheerio from "cheerio";
import {validateSync} from "class-validator";
import produce from "immer";
import _ = require("lodash");
import R from "ramda";
import {Logger} from "winston";
import {selectBy} from "../scraper";
import Tag from "./Tag";

/**
 * extractTags extracts tags from html string.
 *
 * @param html
 * @param logger
 */
export const extract = (html: string, logger: Logger): Tag[] => {
    logger.info("start process tagsExtractor");
    const composer = R.compose(
        R.uniqBy(R.prop("href")),
        // @ts-ignore
        R.sortBy(R.prop("name")),
        R.filter(valid),
        R.map(elementToTag),
        R.curry(selectBy)("div#hits ul.tags-list > li > header"),
    );

    return composer(html);
};

/**
 * valid checks if a tag is valid.
 * @param tag
 */
const valid = (tag: Tag): boolean => validateSync(tag).length === 0;

const elementToTag = (e: CheerioElement): Tag => {
    const selector = cheerio.load(e);
    return R.compose(
        R.curry(getCount)(selector),
        R.curry(getLink)(selector),
    )(new Tag());
};

/**
 * getLink retrieve href and string for tag.
 * @param selector
 * @param tag
 */
const getLink = (selector: CheerioStatic, tag: Tag): Tag => {

    // find getLink and elementToTag content from getLink to tag name
    const aTags = selector("h2 > a").toArray();
    if (aTags.length === 0) {
        return tag;
    }

    // check tagged href
    const regex = RegExp("(tagged\\/)(.*?)");
    if (!regex.test(aTags[0].attribs.href)) {
        return tag;
    }

    // all good
    return produce(tag, newState => {
        newState.name = _.trim(cheerio(aTags[0]).html() as string, "#");
        newState.href = aTags[0].attribs.href;
    });
};

/**
 * getCount retrieves count for tag.
 * @param selector
 * @param tag
 */
const getCount = (selector: CheerioStatic, tag: Tag): Tag => {

    // find span and elementToTag getCount from span
    const spanTags = selector("span.count").toArray();
    if (spanTags.length === 0) {
        return tag;
    }

    return produce(tag, newState => {
        newState.count = +(cheerio(spanTags[0]).html() as string).replace(/[^0-9.]/g, "");
    });
};
