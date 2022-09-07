import { useState } from 'react';
import { createDriver } from 'use-neo4j';
const DEFAULT_DB_SETTINGS = {
  neo4jHost: process.env.REACT_APP_NEO4J_HOST || 'localhost',
  neo4jPort: process.env.REACT_APP_NEO4J_PORT || '7687',
  neo4jUsername: process.env.REACT_APP_NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.REACT_APP_NEO4J_PASSWORD || 'test',
};

export const ConnectDatabase = () => {
  const connectionDriver = createDriver(
    'bolt',
    DEFAULT_DB_SETTINGS.neo4jHost,
    DEFAULT_DB_SETTINGS.neo4jPort,
    DEFAULT_DB_SETTINGS.neo4jUsername,
    DEFAULT_DB_SETTINGS.neo4jPassword
  );
  return connectionDriver;
};

// export const writeQuery = async (query: string, params: any) => {
//   const { loading, first, error } = useReadCypher(query, params);

// };

// async readQuery(query: string) {
//   const session = this.driver.session();

//   try {
//     const readResult = await session.readTransaction((tx) => tx.run(query));
//     return readResult;
//   } catch (error) {
//     console.error('Something went wrong: ', error);
//   } finally {
//     await session.close();
//   }
// }
// async close() {
//   await this.driver.close();
// }
