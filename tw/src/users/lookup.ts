import {S3} from "aws-sdk";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {validateSync} from "class-validator";
import {Map} from "immutable";
import R from "ramda";
import {from, Observable} from "rxjs";
import Twitter = require("twitter");
import {ResponseData} from "twitter";
import {Logger} from "winston";
import {hasPropertyAndNotEmpty, notEmpty, prefixDateTime} from "../logics";
import UsersLookupParameters from "./UsersLookupParameters";
import {flatMap} from "rxjs/operators";
import moment from "moment";
import {getClient} from "../tw";

export const bool2Str = (k: string) => {

    return R.compose(
        R.ifElse(
            R.is(Boolean),
            (x: boolean) => x ? "true" : "false",
            R.identity,
        ),
        // @ts-ignore
        R.prop(k),
    );
};

export const sensitizeArrAndJoin = (glue: string, k: string) => {
    return R.ifElse(
        R.curry(hasPropertyAndNotEmpty)(k),
        R.compose(
            R.join(glue),
            // @ts-ignore
            R.filter(notEmpty),
            R.uniq,
            R.map(
                R.ifElse(
                    R.is(String),
                    R.trim,
                    R.identity,
                )),
            R.prop(k)),
        () => "",
    );
};

export const validateAndLog = (logger: Logger, params: UsersLookupParameters): boolean => {
    const err = validateSync(params);
    if (R.length(err) > 0) {
        logger.error(err);
        return false;
    }
    return true;
};

export const parseParams = (lookupParams: UsersLookupParameters): { [key: string]: any } => {
    return {
        user_id: sensitizeArrAndJoin(",", "_userIds")(lookupParams),
        screen_name: sensitizeArrAndJoin(",", "_screenNames")(lookupParams),
        include_entities: bool2Str("_includeEntities")(lookupParams),
        tweet_mode: bool2Str("_tweetMode")(lookupParams),
    };
};

export const usersLookupObserver = (tw: Twitter, params: object): Observable<ResponseData> => from(tw.get("users/lookup", params));

export const uploadToS3Observer = (key: string, envs: Map<string, string | undefined>, s3: S3, response: ResponseData) => {
    const params: PutObjectRequest = {
        Bucket: envs.get("S3_BUCKET_NAME") as string,
        Key: key,
        Body: JSON.stringify(response),
    };
    return from(s3.upload(params).promise());
};

export const lookupAndUpload = (envs: Map<string, string | undefined>, params: UsersLookupParameters, logger: Logger) => {
    const s3 = new S3({
        accessKeyId: envs.get("S3_ACCESS_KEY_ID"),
        secretAccessKey: envs.get("S3_SECRET_ACCESS_KEY"),
    });
    const tw = getClient(envs);

    return R.compose(
        R.curry(usersLookupObserver)(tw),
        R.when(R.curry(validateAndLog)(logger), parseParams),
    )(params).pipe(
        flatMap(p => uploadToS3Observer(prefixDateTime("YYYY-MM-DD-HH:mm")("users.json", moment()), envs, s3, p)),
    );
};
