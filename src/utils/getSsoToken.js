import xpath from 'xpath';
import { DOMParser } from 'xmldom';
import ssoTokenRequest from './ssoTokenRequest';

let existingToken;

export default async function getSsoToken(isSandbox = false) {
  if (existingToken) {
    return existingToken;
  }

  const tokenResponse = await ssoTokenRequest(isSandbox);
  if (!tokenResponse || !tokenResponse.data) {
    throw new Error('Error fetching token (no response data)');
  }
  const xmldoc = new DOMParser().parseFromString(tokenResponse.data);
  const [node] = xpath.select('//SSOTicket', xmldoc);
  if (!node || !node.firstChild || !node.firstChild.data) {
    throw {
      message: 'Error fetching token (xml data)',
      responseData: tokenResponse.data,
    };
  }

  existingToken = node.firstChild.data;

  // tokens last for 24h
  // clear out after 23h for some leeway
  setTimeout(() => {
    existingToken = null;
  }, 23 * 60 * 60 * 1000);

  return existingToken;
}
