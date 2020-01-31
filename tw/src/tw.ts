import {Map} from "immutable";
import {from} from "rxjs";
import Twitter = require("twitter");

export const getClient = (envs: Map<string, string | undefined>) => {
    return new Twitter({
        consumer_key: envs.get("CONSUMER_API_KEY") as string,
        consumer_secret: envs.get("CONSUMER_API_SECRET_KEY") as string,
        access_token_key: envs.get("ACCESS_TOKEN") as string,
        access_token_secret: envs.get("ACCESS_SECRET") as string,
    });
};

export const usersLookupAndUpload = (tw: Twitter, params: object) => {
    return from(tw.get("users/lookup", params));
};

