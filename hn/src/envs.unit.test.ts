import {Envs, getEnvs, parseEnv, validateEnvs, validateEnvsSync} from "./envs";
import R from "ramda";
import _ from "lodash";
import {validateOrReject} from "class-validator";

describe("parseEnv function", () => {
    it("should parse env variables", async () => {
        const errs = await validateEnvs({});
    });
});
