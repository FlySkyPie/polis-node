# Polis Node

Polis is my side project, the goal is aim to create game engine with several feature:

- Build with ECS (Entity Component System) architecture.
- Server side 3D rendering.
- Distributed computing voxel world.

## Development

```shell
pnpm install
cp spectator-client/.env.sample spectator-client/.env

pnpm run dev
# `polis-node-electron` would randomly pick port for API, change it for `spectator-client`
vi spectator-client/.env
```
