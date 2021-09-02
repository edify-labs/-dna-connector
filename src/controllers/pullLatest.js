import { exec } from 'child_process';

export default function pullLatest(req, res, next) {
  exec('git pull', () => {
    exec('npm i', () => {
      exec('npm run build', () => {
        exec('pm2 restart dna-connector', () => {
          return res.json({ ok: true, message: 'pull latest' });
        });
      });
    });
  });
}
