FROM node:14-alpine

WORKDIR /code/dna-connector

COPY ./ /code/dna-connector

RUN npm install \
  && npm run build

CMD npm run start