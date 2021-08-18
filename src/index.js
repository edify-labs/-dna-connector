/* eslint-disable no-console */
import fs from 'fs';
import https from 'https';
import app from './app';

if (
  process.env.SSL_KEY &&
  process.env.SSL_CERT &&
  process.env.SSL_CA &&
  process.env.NODE_ENV !== 'test'
) {
  https
    .createServer(
      {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
        ca: fs.readFileSync(process.env.SSL_CA),
      },
      app,
    )
    .listen(process.env.PORT, () => {
      console.log(`server started on port ${process.env.PORT}`);
    });
} else {
  app.listen(process.env.PORT, () => {
    console.log(`server started on port ${process.env.PORT}`);
  });
}
