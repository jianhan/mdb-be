import {APIGatewayEvent} from "aws-lambda";
import {S3} from "aws-sdk";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {validateSync} from "class-validator";
import {Map} from "immutable";
import moment from "moment";
import R from "ramda";
import {from, Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import S from "sanctuary";
import Twitter, {ResponseData} from "twitter";
import {Logger} from "winston";
// @ts-ignore
import {Environment} from "../../../lib/src/constants";
// @ts-ignore
import {hasPropertyAndNotEmpty, notEmpty, prefixDateTime} from "../../../lib/src/logics";
import {getTwClient} from "../tw";
import {s3Client} from "../upload";
import UsersLookupParameters from "./UsersLookupParameters";

/**
 * bool2Str convert a boolean value to string.
 * @param k
 */
// @ts-ignore
const bool2Str = (k: string) => R.compose(R.ifElse(R.is(Boolean), (v: boolean) => v ? "true" : "false", R.identity), R.prop(k));

/**
 * sensitizeArrAndJoin sensitize every element in array and join into string.
 * @param glue
 * @param k
 */
const sensitizeArrAndJoin = (glue: string, k: string) => {
    return R.ifElse(
        R.curry(hasPropertyAndNotEmpty)(k),
        // @ts-ignore
        R.compose(R.join(glue), R.filter(notEmpty), R.uniq, R.map(R.ifElse(R.is(String), R.trim, R.identity)), R.prop(k)),
        () => "",
    );
};

/**
 * parse converts UsersLookupParameters parameter into a regular object which will be used for
 * fetching data.
 * @param lookupParams
 */
const parse = (lookupParams: UsersLookupParameters): { [key: string]: any } => {
    return {
        user_id: sensitizeArrAndJoin(",", "_userIds")(lookupParams),
        screen_name: sensitizeArrAndJoin(",", "_screenNames")(lookupParams),
        include_entities: bool2Str("_includeEntities")(lookupParams),
        tweet_mode: bool2Str("_tweetMode")(lookupParams),
    };
};

/**
 * lookup looks up users by API and returns a observable.
 * @param tw
 * @param params
 */
const lookup = (tw: Twitter, params: { [key: string]: any }): Observable<ResponseData> => from(tw.get("users/lookup", params));

/**
 * validate checks if parameter is valid or not.
 * @param params
 */
const validate = (params: UsersLookupParameters) => {
    const err = validateSync(params);
    if (err.length > 0) {
        return S.Left(err);
    }

    return S.Right(params);
};

/**
 * upload uploads response data to s3.
 * @param putObjectRequest
 * @param s3
 * @param o
 */
const upload = (putObjectRequest: PutObjectRequest, s3: S3, o: Observable<ResponseData>) => {
    return o.pipe(
        flatMap(p => from(s3.upload(Object.assign({}, putObjectRequest, {Body: JSON.stringify(p)})).promise())),
    );
};

/**
 * lookupAndUpload compose functions together to fetch data and upload.
 * @param putObjectRequest
 * @param s3
 * @param tw
 */
export const lookupAndUpload = (putObjectRequest: PutObjectRequest, s3: S3, tw: Twitter) => {
    return S.pipe([
        validate, S.map(parse), S.map(S.curry2(lookup)(tw)), S.map(S.curry3(upload)(putObjectRequest)(s3)),
    ]);
};

// tslint:disable-next-line:max-line-length
export const getLookupAndUpload = (envs: Map<string, string | Environment | undefined>, logger: Logger, event: APIGatewayEvent): Observable<any> | undefined => {
    const params = JSON.parse(event.body as string);
    const s3 = s3Client({accessKeyId: envs.get("S3_ACCESS_KEY_ID"), secretAccessKey: envs.get("S3_SECRET_ACCESS_KEY")});
    const tw = getTwClient({
        consumer_key: envs.get("CONSUMER_API_KEY") as string,
        consumer_secret: envs.get("CONSUMER_API_SECRET_KEY") as string,
        access_token_key: envs.get("ACCESS_TOKEN") as string,
        access_token_secret: envs.get("ACCESS_SECRET") as string,
    });
    const key = prefixDateTime("YYYY-MM-DD-HH:mm")("users.json", moment());
    const result = lookupAndUpload({
        Bucket: envs.get("S3_BUCKET_NAME") as string,
        Key: key,
    }, s3, tw)(new UsersLookupParameters(params));

    // @ts-ignore
    return S.either(logger.error, R.identity, result);
};
