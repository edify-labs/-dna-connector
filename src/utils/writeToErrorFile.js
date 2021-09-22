import fs from 'fs';
import path from 'path';

export default function writeToErrorFile(e) {
  const filepath = path.join(`${__dirname}`, '..', '..', 'errors.txt');
  const msg = `${new Date().toISOString()}\n${e}\n--------------------------------------------------------\n\n\n`;
  if (fs.existsSync(filepath)) {
    fs.appendFileSync(filepath, msg);
    e;
  } else {
    fs.writeFileSync(filepath, msg);
  }

  return true;
}
