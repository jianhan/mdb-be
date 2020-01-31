import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {Map} from "immutable";
import Twitter = require("twitter");
import {Logger} from "winston";
import {Environment, LogLevel} from "../constants";
import {getEnvs} from "../envs";
import {createLogger} from "../logger";
import {getClient} from "../tw";
import {lookupAndUpload, parseParams, usersLookupObserver} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";
import SendData = ManagedUpload.SendData;

let tw: Twitter;
let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
    tw = getClient(envs);
});

describe("usersLookupObserver function", () => {

    it("should fetch users data", done => {
        const params = parseParams(new UsersLookupParameters(["chenqiushi404"]));
        usersLookupObserver(tw, params).subscribe(r => {
            expect(r).toHaveLength(1);
            expect(r[0].id).toBe(1182511815231586300);
            done();
        });
    });

});

describe("process integration test", () => {

    it("it should generate params, lookup users and upload", done => {
        const params = new UsersLookupParameters(["chenqiushi404"]);
        lookupAndUpload(envs, params, logger).subscribe(
            (r: SendData) => {
                expect(r).toHaveProperty("ETag");
                done();
            },
            err => {
                logger.error(err);
                done();
            },
            () => {
                logger.info("completed", params);
                done();
            },
        );
    });

});
