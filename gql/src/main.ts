import { ApolloServer } from "apollo-server";

import { environment } from "./environment";
import resolvers from "./resolvers";
import typeDefs from "./type-defs";

const server = new ApolloServer({
    resolvers,
    typeDefs,
    introspection: environment.apollo.introspection,
    playground: environment.apollo.playground,
});

server.listen(environment.port);

if ((module as any).hot) {
    (module as any).hot.accept();
    (module as any).hot.dispose(() => server.stop());
}
