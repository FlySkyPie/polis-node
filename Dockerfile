FROM node:18.20.4-bookworm AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /server

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY polis-node-raub/package.json ./polis-node-raub/package.json
COPY spectator-client/package.json ./spectator-client/package.json
RUN pnpm install --frozen-lockfile

COPY polis-node-raub polis-node-raub
COPY spectator-client spectator-client
COPY packages packages

RUN pnpm --stream -r build

# FROM node:18.20.4-bookworm AS runner
FROM ghcr.io/linuxserver/baseimage-kasmvnc:ubuntunoble AS runner

ARG BUILD_DATE
ARG VERSION
ARG BLENDER_VERSION
LABEL build_version="Linuxserver.io version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="thelamer"

ENV DISPLAY=:1 \
    PERL5LIB=/usr/local/bin \
    OMP_WAIT_POLICY=PASSIVE \
    GOMP_SPINCOUNT=0 \
    HOME=/config \
    START_DOCKER=true \
    PULSE_RUNTIME_PATH=/defaults \
    NVIDIA_DRIVER_CAPABILITIES=all \
    NODE_ENV=production

WORKDIR /config

RUN apt-get update
RUN apt-get install libglew-dev libfreeimage3 libfreeimage-dev libglfw3 libglfw3-dev -y

COPY --from=builder /server/polis-node-raub/dist ./
COPY --from=builder /server/spectator-client/dist ./public

COPY ./build/root /

# ports and volumes
EXPOSE 3000
