## ---- Dependencies ----
#FROM node:alpine AS base
#
## copy project file
#COPY package.json .
#
## install node packages
#RUN npm set progress=false && npm config set depth 0
#
## only install dep not dev
#RUN npm install --only=production
#
## copy production node_modules aside
#RUN cp -R node_modules prod_node_modules
#
## install ALL node_modules, including 'devDependencies'
#RUN npm install &&\
#    npm build
#
## ---- Test ----
## run linters, setup and tests
#FROM base AS test
#COPY . .
#RUN  npm run lint && npm run test
#
## ---- Release ----
#FROM base AS release
## copy production node_modules
#COPY --from=base /root/gql/prod_node_modules ./node_modules
## copy app sources
#COPY . .
## expose port and define CMD
#EXPOSE 4001
#CMD [ "npm", "start" ]

FROM node:11-alpine AS build

LABEL version="1.0"
LABEL description=""
LABEL maintainer="JianHan jianhan@mail.com"

#  because we are using alpine and it does not come with many build tools, we should install the node-gyp collection of tools.
RUN apk add --update --no-cache \
    python \
    make \
    g++

COPY . /src

# Create app directory
WORKDIR /src

RUN npm ci &&\
    npm run build:production &&\
    npm run lint &&\
    npm run test

RUN npm prune --production

FROM node:11.10.0-alpine

EXPOSE 4001
WORKDIR /usr/src/gql

COPY --from=build /src/node_modules node_modules
COPY --from=build /src/dist dist
COPY --from=build /src/package.json package.json

CMD [ "npm", "start" ]


