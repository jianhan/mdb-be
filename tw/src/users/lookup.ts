import {S3} from "aws-sdk";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {validateSync} from "class-validator";
import R from "ramda";
import {from, Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import Twitter, {ResponseData} from "twitter";
import {Logger} from "winston";
import {hasPropertyAndNotEmpty, notEmpty} from "../logics";
import UsersLookupParameters from "./UsersLookupParameters";

const bool2Str = (k: string) => {
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

const sensitizeArrAndJoin = (glue: string, k: string) => {
    return R.ifElse(
        R.curry(hasPropertyAndNotEmpty)(k),
        R.compose(
            R.join(glue),
            // @ts-ignore
            R.filter(notEmpty),
            R.uniq,
            R.map(R.ifElse(R.is(String), R.trim, R.identity)),
            R.prop(k)),
        () => "",
    );
};

const validateAndLog = (logger: Logger, params: UsersLookupParameters): boolean => {
    const err = validateSync(params);
    if (R.length(err) > 0) {
        logger.error(err);
        return false;
    }
    return true;
};

const parseParams = (lookupParams: UsersLookupParameters): { [key: string]: any } => {
    return {
        user_id: sensitizeArrAndJoin(",", "_userIds")(lookupParams),
        screen_name: sensitizeArrAndJoin(",", "_screenNames")(lookupParams),
        include_entities: bool2Str("_includeEntities")(lookupParams),
        tweet_mode: bool2Str("_tweetMode")(lookupParams),
    };
};

const usersLookupObserver = (tw: Twitter, params: object): Observable<ResponseData> => from(tw.get("users/lookup", params));

const uploadToS3Observer = (bucketName: string, key: string, s3: S3, response: ResponseData) => {
    const params: PutObjectRequest = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(response),
    };
    return from(s3.upload(params).promise());
};

export const lookupAndUpload = (bucketName: string, key: string, s3: S3, tw: Twitter, params: UsersLookupParameters, logger: Logger) => {
    return R.compose(
        R.curry(usersLookupObserver)(tw),
        R.when(R.curry(validateAndLog)(logger), parseParams),
    )(params).pipe(
        flatMap(p => uploadToS3Observer(bucketName, key, s3, p)),
    );
};
