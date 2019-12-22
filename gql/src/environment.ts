const defaultPort = 4000;

interface IEnvironment {
    apollo: {
        introspection: boolean,
        playground: boolean,
    };
    port: number|string;
}

export const environment: IEnvironment = {
    apollo: {
        introspection: process.env.APOLLO_INTROSPECTION === "true",
        playground: process.env.APOLLO_PLAYGROUND === "true",
    },
    port: process.env.PORT || defaultPort,
};
