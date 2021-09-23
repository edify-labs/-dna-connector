import fs from 'fs';
import path from 'path';

export default function getErrorFile(req, res, next) {
  const { pm2 = false } = req.query;
  const filepath = pm2
    ? '/root/.pm2/logs/dna-connector-out.log'
    : path.join(`${__dirname}`, '..', '..', 'errors.txt');
  const data = fs.readFileSync(filepath);
  return res.status(200).send(data);
}
