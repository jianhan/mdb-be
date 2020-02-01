import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {Map} from "immutable";
import moment from "moment";
import {Logger} from "winston";
import {Environment, LogLevel} from "../constants";
import {getEnvs} from "../envs";
import {createLogger} from "../logger";
import SendData = ManagedUpload.SendData;
import {prefixDateTime} from "../logics";
import {getTwClient} from "../tw";
import {s3Client} from "../upload";
import {lookupAndUpload} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";

let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
});

describe("process integration test", () => {

    it("it should generate params, lookup users and upload", done => {
        const params = new UsersLookupParameters(["chenqiushi404"]);
        const key = prefixDateTime("YYYY-MM-DD-HH:mm")("users.json", moment());
        const s3 = s3Client({
            accessKeyId: envs.get("S3_ACCESS_KEY_ID"),
            secretAccessKey: envs.get("S3_SECRET_ACCESS_KEY"),
        });

        const tw = getTwClient({
            consumer_key: envs.get("CONSUMER_API_KEY") as string,
            consumer_secret: envs.get("CONSUMER_API_SECRET_KEY") as string,
            access_token_key: envs.get("ACCESS_TOKEN") as string,
            access_token_secret: envs.get("ACCESS_SECRET") as string,
        });

        lookupAndUpload(envs.get("S3_BUCKET_NAME") as string, key, s3, tw, params, logger).subscribe(
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
