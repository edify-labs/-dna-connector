FROM alpine:3.14.2

WORKDIR /code

COPY entrypoint.sh /code/entrypoint.sh

COPY dna-connector.json /code/dna-connector.json

RUN apk add nodejs git npm \
  && npm install -g pm2 \
  && git clone https://github.com/edify-labs/dna-connector.git \
  && cd dna-connector \
  && npm install \
  && npm run build

WORKDIR /code/dna-connector

ENTRYPOINT ["/code/entrypoint.sh"]