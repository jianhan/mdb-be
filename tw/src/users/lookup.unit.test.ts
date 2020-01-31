import {bool2Str, parseParams, sensitizeArrAndJoin} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";

let lookupParams: UsersLookupParameters;

beforeEach(() => {
    lookupParams = new UsersLookupParameters(["test   ", "test1    ", "test", "test1", "", "test2"], [99, 100, 1, 2, 3, 1, 1, 2, 2], true, false);
});

describe("function sensitizeArrAndJoin", () => {

    it("should trim elements and remove duplicates for screen names", () => {
        const screenNames = sensitizeArrAndJoin(",", "_screenNames")(lookupParams);
        expect(screenNames).toEqual("test,test1,test2");
    });

    it("should trim elements and remove duplicates for user ids", () => {
        const screenNames = sensitizeArrAndJoin(",", "_userIds")(lookupParams);
        expect(screenNames).toEqual("99,100,1,2,3");
    });

});

describe("function bool2Str", () => {

    it("should convert bool to string", () => {
        const includeEntities = bool2Str("_includeEntities")(lookupParams);
        expect(includeEntities).toEqual("true");

        const tweetMode = bool2Str("_tweetMode")(lookupParams);
        expect(tweetMode).toEqual("false");

    });

});

describe("function paramsObjToAPIParams", () => {

    it("it should convert to object", () => {
        const result = parseParams(lookupParams);
        expect(result).toEqual({
            user_id: "99,100,1,2,3",
            screen_name: "test,test1,test2",
            include_entities: "true",
            tweet_mode: "false",
        });
    });

});
