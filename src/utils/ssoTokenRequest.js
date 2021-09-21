import fs from 'fs';
import axios from 'axios';
import https from 'https';
import { randomBytes } from 'crypto';
import { getConfig } from '../constants';
import createSoapRequest from './createSoapRequest';

export default async function ssoTokenRequest(isSandbox = false) {
  const date = new Date();
  const xsd = `${date.toISOString()}${date.getTimezoneOffset() / 60}:00`;
  const trackingId = randomBytes(8).toString('hex');
  const config = getConfig(isSandbox);

  const xmlBody = `<DirectSSORequest MessageDateTime="${xsd}" TrackingId="${trackingId}">
    <DeviceId>edifyDnaConnector</DeviceId>
    <UserId>${config.vars?.dnaUserId}</UserId>
    <Password>${config.vars?.dnaPassword}</Password>
    <ProdEnvCd>${config.vars?.dnaEnvironment}</ProdEnvCd>
    <ProdDefCd>${config.vars?.dnaDefCode}</ProdDefCd>
  </DirectSSORequest>`;
  const data = createSoapRequest(xmlBody);
  const axiosConfig = {
    url: config.safUrl,
    data,
    headers: {
      'Content-Type': 'application/soap+xml',
      SOAPAction: 'http://www.opensolutions.com/DirectSignon',
    },
    method: 'post',
  };

  const ca = fs.readFileSync(config.ca);
  const cert = fs.readFileSync(config.cert);
  if (config.ca && config.cert) {
    axiosConfig.httpsAgent = new https.Agent({
      ca: `${ca}\n${cert}`,
    });
  }

  return axios(axiosConfig);
}
