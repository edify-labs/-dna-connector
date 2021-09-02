#!/bin/sh
pid=0

pm2 start /code/dna-connector.json

# wait forever
while true
do
  tail -f /dev/null & wait ${!}
done