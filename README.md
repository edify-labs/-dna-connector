# dna-connect
Used to communicate with on-premises active directory.

## usage
- Copy .env.example, fill in missing values, rename as .env
- Copy given certs to ssl directory on host machine.
- Replace /PATH/TO/ENV with path to .env file
- Replace CONTAINER_PORT with PORT from .env
- Replace HOST_PORT with target port on host machine
```
docker run -d -v /ssl:/ssl --env-file /PATH/TO/ENV -p HOST_PORT:CONTAINER_PORT --restart=always --name edify-dna-connector docker-reg.edifylabs.net/dna-connector:latest
```

or run from node:
- Install dependencies:
```
npm i
```
- Build:
```
npm run build
```
- Start:
```
npm start
```
