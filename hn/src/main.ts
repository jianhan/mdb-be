import rp from "request-promise-native";
import {from} from "rxjs";
import {Environment, getEnvs} from "./envs";
import {createLogger} from "./logger";

export const run = async () => {
    try {
        const envs = await getEnvs({NODE_ENV: "development"});
        const logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string);
        from(rp.get("https://hackernoon.com/")).subscribe(html => console.log(html), error => console.log(error));
    } catch (err) {
        throw new Error("unable to process, error(s) encountering" + err);
    }
};
