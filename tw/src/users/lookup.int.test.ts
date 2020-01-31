import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {Map} from "immutable";
import {Logger} from "winston";
import {Environment, LogLevel} from "../constants";
import {getEnvs} from "../envs";
import {createLogger} from "../logger";
import {lookupAndUpload} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";
import SendData = ManagedUpload.SendData;

let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
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
