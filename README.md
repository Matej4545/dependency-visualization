# Dependency visualization - DepVis

Tool for visualization of open source dependencies and vulnerabilities from Software Bill of Materials (SBOM).

This tool was developed as part of Master's thesis "Visualization of Vulnerabilities in Open Source Software Dependencies" at FI MUNI.

## Prerequisites

- Docker & Docker Compose
- Node (> v16)

## Deployment

### Using Docker locally

- Clone this repository
- _Optional_ Change login credentials for neo4j by editing [docker-compose.yml](./docker-compose.yml)
- Create environment variables file according to sample file in Next.js app - [example](./src/depvis-next/.env.production.example)
- To start all services use `docker-compose up`
- For more details follow installation steps for Next.js app [here](./src/depvis-next/README.md)

### Using Azure containers

- Clone this repository
- Follow [official guide](https://learn.microsoft.com/en-us/azure/container-instances/tutorial-docker-compose) to create Azure container repository (ACR), publish DepVis image and create new Docker context
- Use [./docker-compose-azure.yml] to deploy containers in Azure (you'll need to update name of the container according to your ACR)

## Repository content

- [sample_bom](./sample_bom/): Contains sample SBOM files for quick testing purposes
- [src/depvis-next](./src/depvis-next/): Next.js web application
- [docker-compose.yml](./docker-compose.yml): Create containers necessary for proper functionality
