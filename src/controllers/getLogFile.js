import fs from 'fs';

export default function getLogFile(req, res, next) {
  const filepath = '/root/.pm2/logs/dna-connector-out.log';
  const data = fs.readFileSync(filepath);
  return res.status(200).send(data);
}
