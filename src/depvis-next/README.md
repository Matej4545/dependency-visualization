# Depvis-next

A language-independent package dependencies visualization tool that use [CycloneDX](https://cyclonedx.org/) SBOM formatted files as input and creates graphic visualization that can help identify vulnerabilities and software structure.

## Project Content

- apollo
  - contains code related to Apollo Client and Apollo Server
- components
  - contains code for React components used to build the application
- helpers
  - contains helper functions responsible for business logic tasks
- pages
  - contains Next.js pages, the web structure is created based on the paths
  - api
    - contains API endpoints
- queues
  - contains import queue and vulnerability queue used in the DepVis
- styles
  - css styles
- types
  - contains type definitions for various objects shared across DepVis
- vulnerability-mgmt
  - contains logic for vulnerability fetchers

## Deployment

### Docker (preferred way)

- This application can be deployed as Docker container - see [Dockerfile](./Dockerfile) for more details.
- During deployment, a file `.env.production` is used to set secrets and other variables. Make sure to provide at least connection strings to neo4j DB and redis cache. Values should be corresponding to the one set in `docker-compose.yaml` if used to run whole infrastructure.

### Other

- For other types of deployment please follow instructions in [Next.js documentation](https://nextjs.org/docs/deployment)

## Development

- create `.env.local` file in this directory and set variables (see dotenv.sample for available variables)
  - provide Neo4J connection variables for proper functionality
- install packages by using `npm install`
- run application by using `npm run dev`
- open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
