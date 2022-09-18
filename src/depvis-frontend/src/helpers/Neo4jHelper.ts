import { useState } from 'react';
import { createDriver, useReadCypher } from 'use-neo4j';
import React from 'react'
import neo4j from 'neo4j-driver'

const DEFAULT_DB_SETTINGS = {
  neo4jHost: process.env.REACT_APP_NEO4J_HOST || 'neo4j://localhost:7687',
  neo4jUsername: process.env.REACT_APP_NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.REACT_APP_NEO4J_PASSWORD || 'test',
};

export const getDriver = () => {
  return neo4j.driver(
    DEFAULT_DB_SETTINGS.neo4jHost,
    neo4j.auth.basic(
        DEFAULT_DB_SETTINGS.neo4jUsername,
        DEFAULT_DB_SETTINGS.neo4jPassword
        )
  );
};

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
