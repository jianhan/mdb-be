import {constructParams} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";

describe("function convertScreenNames", () => {

    it("should convert all properties", () => {
        const params = new UsersLookupParameters(["test   ", "test1    ", "test", "test1"], [1, 2, 3, 1, 1, 2, 2], true, true);
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
