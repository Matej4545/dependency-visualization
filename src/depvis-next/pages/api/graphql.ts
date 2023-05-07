import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { neoSchema } from "../../apollo/ApolloSchema";
import { setCorsPolicy } from "../../apollo/ApolloServer";

const server = async (): Promise<ApolloServer> => {
  const schema = await neoSchema.getSchema();
  return new ApolloServer({
    schema,
  });
};

export default setCorsPolicy(startServerAndCreateNextHandler(await server()));
