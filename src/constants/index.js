const url = process.env.DNA_URL;
const headers = { 'Content-Type': 'application/xml' };
const method = 'post';

export const config = { url, headers, method, responseType: 'text' };