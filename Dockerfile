ARG node_version=14.7

FROM node:${node_version} AS build-back
RUN useradd -m diabetips-account
USER diabetips-account
WORKDIR /home/diabetips-account
COPY back/package.json back/package-lock.json ./
RUN npm install --production
COPY back/tsconfig.json ./
COPY back/src ./src
RUN npm run build

FROM node:${node_version} AS build-front
ARG angular_configuration
RUN useradd -m diabetips-account
USER diabetips-account
WORKDIR /home/diabetips-account
COPY front/package.json front/package-lock.json ./
RUN npm install
COPY front/tsconfig.json front/tsconfig.base.json front/tsconfig.app.json ./
COPY front/angular.json front/.browserslistrc ./
COPY front/src ./src
RUN npm run build -- --configuration=${angular_configuration}

FROM node:${node_version}
RUN useradd -m diabetips-account
USER diabetips-account
WORKDIR /home/diabetips-account
COPY back/package.json ./
COPY --from=build-back /home/diabetips-account/node_modules ./node_modules
COPY back/config ./config
COPY --from=build-back /home/diabetips-account/build ./build
COPY --from=build-front /home/diabetips-account/dist/diabetips-account ./static
