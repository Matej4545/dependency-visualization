# dependency-visualization

## Prerequisites

- Docker & Docker Compose
- Node (v16)

## Installation

- Clone this repository
- _Optional_ Change login credentials for neo4j by editing `docker-compose.yml`
- Run `docker-compose up` to start up Neo4J DB
- Follow installation steps for Next.js app [here](./src/depvis-next/README.md)

## Repository content

- sample_bom: Contains sample SBOM files for quick testing purposes
- src
  - depvis-next: Next.js web application
- docker-compose.yml: Create containers necessary for proper functionality
