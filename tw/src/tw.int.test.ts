import {Map} from "immutable";
import {Logger} from "winston";
import {Environment, LogLevel} from "./constants";
import {getEnvs} from "./envs";
import {createLogger} from "./logger";
import {getClient} from "./tw";

jest.setTimeout(30000);

let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
});

describe("users",   () => {
    it("should lookup multiply users and upload", done => {
        const client = getClient(envs);
        client.get("users/lookup", {screen_name: "realDonaldTrump"}, (error, tweets, response) => {
            console.log(tweets);
            done();
        });
    });
});
