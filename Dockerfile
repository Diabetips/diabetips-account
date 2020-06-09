ARG node_version=13.13

FROM node:${node_version} AS build
RUN useradd -m diabetips-account
USER diabetips-account
WORKDIR /home/diabetips-account
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --production
COPY src ./src
RUN npm run build

FROM node:${node_version}
RUN useradd -m diabetips-account
USER diabetips-account
WORKDIR /home/diabetips-account
COPY package.json ./
COPY --from=build /home/diabetips-account/node_modules ./node_modules
COPY config ./config
COPY static ./static
COPY views ./views
COPY --from=build /home/diabetips-account/build ./build
