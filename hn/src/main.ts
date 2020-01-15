import rp from "request-promise-native";
import {from} from "rxjs";
import {Environment, getEnvs} from "./envs";
import {createLogger, getLogLevel} from "./logger";
import R from "ramda";
import {either, fold} from "fp-ts/lib/Either";

export const run = async () => {
    try {
        const envs = await getEnvs(process.env);

        const createLoggerByEnv = R.partial(createLogger, [envs.get("NODE_ENV"), envs.get("SERVICE")]);
        fold(either.map(
            getLogLevel(envs.get("NODE_ENV") as Environment),
            createLoggerByEnv,
        ));

        const logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string);
        from(rp.get("https://hackernoon.com/")).subscribe(html => console.log(html), error => console.log(error));
    } catch (err) {
        throw new Error("unable to process, error(s) encountering" + err);
    }
};
