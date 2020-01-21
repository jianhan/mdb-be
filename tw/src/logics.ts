import R from "ramda";

export const hasPropertyAndNotEmpty = (k: string, input: any) => R.and(
    R.has(k)(input),
    R.propSatisfies(x => R.not(R.isEmpty(x)), k, input),
);
