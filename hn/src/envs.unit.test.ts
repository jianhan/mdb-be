import {ValidationError} from "class-validator";
import {Map} from "immutable";
import jsc from "jsverify";
import {Environment} from "./constants";
import {getEnvs} from "./envs";

describe("getEnvs function", () => {

    it("should get valid envs with valid input", async () => {
        const allPossibleEnvs = [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.UAT, Environment.STAGE];
        await jsc.assert(
            jsc.forall(jsc.elements(allPossibleEnvs), jsc.nestring, async (env: Environment, serviceName: string) => {
                const expected = await getEnvs({NODE_ENV: env, SERVICE_NAME: serviceName});
                expect(expected).toBeInstanceOf(Map);
                return true;
            },
        ));
    });

    it("should return errors service name is empty", async () => {
        try {
            await getEnvs({NODE_ENV: Environment.DEVELOPMENT, SERVICE_NAME: ""});
        } catch (e) {
            expect(e).toBeInstanceOf(Array);
            expect(e.length).toBe(1);
            expect(e[0]).toBeInstanceOf(ValidationError);
            expect(e[0].property).toBe("SERVICE_NAME");
        }
    });

});
