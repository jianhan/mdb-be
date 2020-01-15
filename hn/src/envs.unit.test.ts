import {Map} from "immutable";
import jsc from "jsverify";
import {Environment} from "./constants";
import {getEnvs} from "./envs";

describe("getEnvs function", () => {

    it("should get valid envs with valid input", async () => {
        const envArr = [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.UAT, Environment.STAGE];
        await jsc.assert(
            jsc.forall(
                jsc.elements(envArr),
                jsc.nestring,
                jsc.nestring,
                jsc.nestring,
                jsc.nestring,
                async (env: Environment, serviceName: string, s3AccessKeyId: string, s3SecretAccessKey: string, s3BucketName: string) => {
                const expected = await getEnvs({
                    NODE_ENV: env,
                    SERVICE_NAME: serviceName,
                    S3_ACCESS_KEY_ID: s3AccessKeyId,
                    S3_SECRET_ACCESS_KEY: s3SecretAccessKey,
                    S3_BUCKET_NAME: s3BucketName,
                });
                expect(expected).toBeInstanceOf(Map);
                return true;
            },
        ));
    });

    it("should return errors when required configs are missing", async () => {
        const envArr = [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.UAT, Environment.STAGE];
        await jsc.assert(
            jsc.forall(
                jsc.elements(envArr),
                async (env: Environment) => {
                    try {
                        await getEnvs({
                            NODE_ENV: env,
                        });
                    } catch (e) {
                        expect(e).toBeInstanceOf(Array);
                        expect(e).toHaveLength(4);
                        expect(e[0]).toHaveProperty("property", "SERVICE_NAME");
                        expect(e[1]).toHaveProperty("property", "S3_ACCESS_KEY_ID");
                        expect(e[2]).toHaveProperty("property", "S3_SECRET_ACCESS_KEY");
                        expect(e[3]).toHaveProperty("property", "S3_BUCKET_NAME");
                    }
                    return true;
                },
            ));
    });

});
