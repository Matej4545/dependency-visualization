import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { setCorsPolicy } from "../../apollo/ApolloServer";
import { neoSchema } from "../../apollo/ApolloSchema";

const server = async (): Promise<ApolloServer> => {
  const schema = await neoSchema.getSchema();
  return new ApolloServer({
    schema,
  });
};

export default setCorsPolicy(startServerAndCreateNextHandler(await server()));
