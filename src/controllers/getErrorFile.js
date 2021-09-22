import fs from 'fs';
import path from 'path';

export default function getErrorFile(req, res, next) {
  const filepath = path.join(`${__dirname}`, '..', '..', 'errors.txt');
  const data = fs.readFileSync(filepath);
  return res.status(200).send(data);
}
