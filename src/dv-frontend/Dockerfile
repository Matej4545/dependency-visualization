# app Dockerfile
# https://medium.com/@shakyShane/lets-talk-about-docker-artifacts-27454560384f
# https://mherman.org/blog/dockerizing-a-react-app/

FROM node:alpine AS react-build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install react-scripts

COPY . ./

RUN npm run build

FROM nginx:alpine

COPY --from=react-build /usr/src/app/build  /var/www/dv-frontend
COPY nginx/*.conf /etc/nginx/conf.d
