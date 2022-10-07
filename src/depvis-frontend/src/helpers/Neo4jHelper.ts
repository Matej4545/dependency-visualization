import neo4j from 'neo4j-driver';

const DEFAULT_DB_SETTINGS = {
  neo4jHost: process.env.REACT_APP_NEO4J_HOST || 'neo4j://localhost:7687',
  neo4jUsername: process.env.REACT_APP_NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.REACT_APP_NEO4J_PASSWORD || 'test',
};

export class Neo4jHelper {
  driver: any;
  isConnected: boolean;
  constructor() {
    this.driver = neo4j.driver(
      DEFAULT_DB_SETTINGS.neo4jHost,
      neo4j.auth.basic(DEFAULT_DB_SETTINGS.neo4jUsername, DEFAULT_DB_SETTINGS.neo4jPassword)
    );
    this.isConnected = false;
    this.checkConnection();
  }

  checkConnection = async () => {
    try {
      const res = await this.driver.getServerInfo();
    } catch {
      console.error('Could not make connection to the server!');
      this.isConnected = false;
    }
    this.isConnected = true;
  };
  writeQuery = async (query: string, params: Record<string, any>) => {
    return await this.Query(query, params, { defaultAccessMode: neo4j.session.WRITE });
  };

  readQuery = async (query: string, params: Record<string, any>) => {
    return await this.Query(query, params, { defaultAccessMode: neo4j.session.READ });
  };

  Query = async (query: string, params: Record<string, any>, sessionOptions: Record<string, any> | undefined) => {
    if (!this.isConnected) {
      throw Error('Database is not connected!');
    }
    const session = this.driver.session(sessionOptions);
    var result = null;
    try {
      console.log({ query: query, params: params });
      result = await session.run(query, params);
    } catch (error) {
      throw error;
    }
    session.close();
    console.log(result);
    return result;
  };
}
