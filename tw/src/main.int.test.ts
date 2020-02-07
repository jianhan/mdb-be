import {Map} from "immutable";
import {Logger} from "winston";
import {Environment, LogLevel} from "../../lib/src/constants";
// @ts-ignore
import {getEnvs} from "../../lib/src/envs";
// @ts-ignore
import {createLogger} from "../../lib/src/logger";
import {Envs} from "./envs";
import {handler} from "./main";

jest.setTimeout(12000);

let envs: Map<string, string | Environment | undefined>;
let logger: Logger;

beforeEach(async () => {
    envs = await getEnvs(process.env, Envs);
    logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
});

describe("main function", () => {
    it("should invoke lambdaFunc and process the request", async () => {
        // @ts-ignore
        const r = await handler({
            path: "./users/index",
            // @ts-ignore
            body: {screenNames: ["chenqiushi404"]},
        });
        logger.info(r, "******");
    });
})
