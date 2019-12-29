FROM node:11-alpine AS base
LABEL version="1.0"
LABEL description=""
LABEL maintainer="JianHan jianhan@mail.com"

#  because we are using alpine and it does not come with many build tools, we should install the node-gyp collection of tools.
RUN apk add --update --no-cache \
    python \
    make \
    g++

# copy all files over to src
COPY . /src

# set work dir
WORKDIR /src

# install packages
RUN npm install && npm run build:development

# ------------------lint build stage-------------------------
FROM base AS lint
COPY . .
RUN npm run lint

# ------------------test build stage-------------------------
FROM base AS test
COPY . .
RUN npm run test

# ------------------production build stage-------------------------
FROM node:11.10.0-alpine

EXPOSE 4001
WORKDIR /usr/src/gql

COPY --from=base /src/dist dist
COPY --from=base /src/package.json package.json
RUN npm i --production

CMD [ "npm", "start" ]
