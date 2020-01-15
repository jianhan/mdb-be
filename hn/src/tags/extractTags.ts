import cheerio from "cheerio";
import {validateSync} from "class-validator";
import _ = require("lodash");
import R from "ramda";
import {Logger} from "winston";
import Tag from "./Tag";

/**
 * extractTags extracts tags from html string.
 *
 * @param html
 * @param logger
 */
export const extractTags = (html: string, logger: Logger): Tag[] => {
    logger.info("start process tagsExtractor");
    const composer  = R.compose(
        R.uniqBy(R.prop("href")),
        // @ts-ignore
        R.sortBy(R.prop("name")),
        R.filter(valid),
        R.map(extract),
        R.curry(selectBy)("div#hits ul.tags-list > li > header"),
    );

    return composer(html);
};

const selectBy = (selector: string, html: string): CheerioElement[] => cheerio.load(html)(selector).toArray();

const valid = (tag: Tag): boolean => validateSync(tag).length === 0;

const extract = (e: CheerioElement): Tag => {
    const selector = cheerio.load(e);
    return R.compose(
        R.curry(count)(selector),
        R.curry(link)(selector),
    )(new Tag());
};

const link = (selector: CheerioStatic, tag: Tag): Tag => {

    // find link and extract content from link to tag name
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
    tag.name =  _.trim(cheerio(aTags[0]).html() as string, "#");
    tag.href = aTags[0].attribs.href;

    return tag;
};

const count = (selector: CheerioStatic, tag: Tag): Tag => {

    // find span and extract count from span
    const spanTags = selector("span.count").toArray();
    if (spanTags.length === 0) {
        return tag;
    }
    tag.count = +(cheerio(spanTags[0]).html() as string).replace(/[^0-9.]/g, "");

    return tag;
};
