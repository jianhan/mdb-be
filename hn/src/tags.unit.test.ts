import fs from "fs";
import {Map} from "immutable";
import path from "path";
import R from "ramda";
import {Logger} from "winston";
import {getEnvs} from "./envs";
import {createLogger} from "./logger";
import {tagsExtractor} from "./tags";
import {Environment} from "./constants";
import jsc from "jsverify";
import _ = require("lodash");

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
        envs = await getEnvs({NODE_ENV: Environment.DEVELOPMENT as string, SERVICE_NAME: "hn"});
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
        jsc.assert(jsc.forall(
            jsc.array(jsc.string),
            (arr: string[]): boolean => {
                console.log(arr, "----");
                return tagsExtractor(_.join(arr, " "), logger).length === 0;
            },
        ));
    });

});
