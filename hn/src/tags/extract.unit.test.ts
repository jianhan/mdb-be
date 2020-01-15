import fs from "fs";
import {Map} from "immutable";
import jsc from "jsverify";
import _ = require("lodash");
import path from "path";
import R from "ramda";
import {Logger} from "winston";
import {Environment, LogLevel} from "../constants";
import {getEnvs} from "../envs";
import {createLogger} from "../logger";
import {extractTags} from "./extractTags";

interface ITagsObj {
    expectedTags: string[];
}

const jsonStrToObj = (json: string): ITagsObj => JSON.parse(json) as ITagsObj;
const extractTagsFromObj = (o: ITagsObj): string[] => o.expectedTags;
const readFileByPath = (e: string) => (p: string): string => fs.readFileSync(p, e);
const genTagsArr = R.compose(extractTagsFromObj, jsonStrToObj, readFileByPath("utf8"));

describe("extract function", () => {
    // declare variables before each tests
    let envs: Map<string, string | Environment | undefined>;
    let pathPrefixFunc: (str: string) => string;
    let logger: Logger;

    // setup variables before each tests
    beforeEach(async () => {
        envs = await getEnvs({
            NODE_ENV: Environment.DEVELOPMENT as string,
            SERVICE_NAME: "hn", S3_ACCESS_KEY_ID: "test",
            S3_SECRET_ACCESS_KEY: "test",
            S3_BUCKET_NAME: "test",
        });
        pathPrefixFunc = R.partial(path.join, [__dirname, "__tests__"]);
        logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
    });

    it("should fetch all tags", () => {
        const htmlPath = pathPrefixFunc("tags.html");
        const tagsPath = pathPrefixFunc("tags.json");
        const actualTags = extractTags(readFileByPath("utf8")(htmlPath), logger);
        const expectedTags = genTagsArr(tagsPath);

        // assertion
        expect(actualTags).toEqual(expectedTags);
    });

    it("should return empty array with invalid html", () => {
        jsc.assert(jsc.forall(
            jsc.array(jsc.string),
            (arr: string[]): boolean => {
                return extractTags(_.join(arr, " "), logger).length === 0;
            },
        ));
    });

});
