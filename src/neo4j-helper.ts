const neo4j = require('neo4j-driver');
const uri = 'neo4j+s://e6e2dff3.databases.neo4j.io';
const user = 'neo4j';
const password = 'QAMYBPhX5SlkpRX7_HauQc1IZ9pQaDPLM0eq1bUAeuY';

export class Neo4jClient {
  driver: any;
  constructor() {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async writeQuery(query: string) {
    const session = this.driver.session();
    try {
      const writeResult = await session.writeTransaction((tx) => tx.run(query));
      return writeResult;
    } catch (error) {
      console.error('Something went wrong: ', error);
    } finally {
      await session.close();
    }
  }

  async readQuery(query: string) {
    const session = this.driver.session();

    try {
      const readResult = await session.readTransaction((tx) => tx.run(query));
      return readResult;
    } catch (error) {
      console.error('Something went wrong: ', error);
    } finally {
      await session.close();
    }
  }
  async close() {
    await this.driver.close();
  }
}
