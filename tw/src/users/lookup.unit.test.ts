import R from "ramda";
import {constructParams, getAPIParams} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";

let params: UsersLookupParameters;

beforeEach(() => {
    params = new UsersLookupParameters(["test   ", "test1    ", "test", "test1"], [1, 2, 3, 1, 1, 2, 2], true, true);
});

describe("function convertScreenNames", () => {

    it("should convert all properties", () => {
        // @ts-ignore
        const apiParams = constructParams(params)({});
        expect(apiParams).toEqual({
            tweet_mode: true,
            include_entities: true,
            user_id: "1,2,3",
            screen_name: "test,test1",
        });
    });

});

describe("function getAPIParams", () => {

    it("should return valid api params with valid input", () => {
        const result = getAPIParams(params);
        expect(result._tag).toBe("Right");
    });

    it("should fail when screenNames exceed max size", () => {
        params.screenNames = R.range(1, 102).map(x => "test name " + x);
        expect(getAPIParams(params)._tag).toBe("Left");

        params.screenNames = R.range(1, 101).map(x => "test name " + x);
        expect(getAPIParams(params)._tag).toBe("Right");
    });

    it("should fail when userIds exceed max size", () => {
        params.userIds = R.range(1, 102);
        expect(getAPIParams(params)._tag).toBe("Left");

        params.userIds = R.range(1, 101);
        expect(getAPIParams(params)._tag).toBe("Right");
    });

});
