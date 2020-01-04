import fs from "fs";
import path from "path";
import R from "ramda";
import {tagsExtractor} from "./extractors";
import {Environment, getEnvs} from "./envs";
import {createLogger} from "./logger";
import {Map} from "immutable";
import {Logger} from "winston";

interface ITagsObj {
    expectedTags: string[];
}
const jsonStrToObj = (json: string): ITagsObj => JSON.parse(json) as ITagsObj;
const extractTagsFromObj = (o: ITagsObj): string[] => o.expectedTags;
const readFileByPath = (e: string) => (p: string): string => fs.readFileSync(p, e);
const genTagsArr = R.compose(extractTagsFromObj, jsonStrToObj, readFileByPath("utf8"));

describe("tagsExtractor function", () => {
    // declare variables before each tests
    let envs: Map<string, string | Environment | undefined>;
    let pathPrefixFunc: (str: string) => string;
    let logger: Logger;

    // setup variables before each tests
    beforeEach(async () => {
        envs = await getEnvs({NODE_ENV: process.env.NODE_ENV, SERVICE_NAME: "hn"});
        pathPrefixFunc = R.partial(path.join, [__dirname, "__tests__"]);
        logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string);
    });

    it("should fetch all tags", () => {
        const htmlPath = pathPrefixFunc("hn.html");
        const tagsPath = pathPrefixFunc("hn.tags.json");
        const actualTags = tagsExtractor(readFileByPath("utf8")(htmlPath), logger);
        const expectedTags = genTagsArr(tagsPath);
        // assertion
        expect(expectedTags).toEqual(actualTags);
    });

    it("should return empty array with invalid html", () => {
        const actualTags = tagsExtractor("invalidHtml", logger);
        expect([]).toEqual(actualTags);
    });

});
