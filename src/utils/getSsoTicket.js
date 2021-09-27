import xpath from 'xpath';
import fs from 'fs';
import axios from 'axios';
import https from 'https';
import { randomBytes } from 'crypto';
import { DOMParser } from 'xmldom';
import { getConfig } from '../constants';
import { writeToErrorFile } from '.';

export default async function getSsoTicket(isSandbox = false) {
  const date = new Date();
  const xsd = `${date.toISOString()}${date.getTimezoneOffset() / 60}:00`;
  const trackingId = randomBytes(8).toString('hex');
  const config = getConfig(isSandbox);
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/">
     <soapenv:Header/>
     <soapenv:Body>
        <open:DirectSignon>
           <open:xmlRequest>
              <![CDATA[<DirectSSORequest MessageDateTime="${xsd}" TrackingId="${trackingId}">
                  <DeviceId>${config.vars?.dnaNetworkNodeName?.trim()}</DeviceId>
                  <UserId>${config.vars?.dnaUserId?.trim()}</UserId>
                  <Password>${config.vars?.dnaPassword?.trim()}</Password>
                  <ProdEnvCd>${config.vars?.dnaEnvironment?.trim()}</ProdEnvCd>
                  <ProdDefCd>${config.vars?.dnaDefCode?.trim()}</ProdDefCd>
              </DirectSSORequest>]]>
           </open:xmlRequest>
        </open:DirectSignon>
     </soapenv:Body>
  </soapenv:Envelope>`;
  writeToErrorFile(
    JSON.stringify(
      {
        data: xmlBody,
        config,
      },
      null,
      2,
    ),
  );

  const axiosConfig = {
    url: `${config.safUrl}`,
    data: xmlBody,
    headers: {
      'Content-Type': 'text/xml',
      SOAPAction: `http://www.opensolutions.com/DirectSignon`,
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

  const tokenResponse = await axios(axiosConfig);
  if (!tokenResponse || !tokenResponse.data) {
    throw new Error('Error fetching token (no response data)');
  }

  console.log(tokenResponse.data);
  const xmldoc = new DOMParser().parseFromString(str);
  const select = xpath.useNamespaces({ soap: 'http://schemas.xmlsoap.org/soap/envelope/' });
  const [envelope] = select('//soap:Envelope', xmldoc);
  if (!envelope?.lastChild?.childNodes?.[0]?.firstChild?.childNodes?.[0]?.data) {
    throw {
      message: 'Error fetching token (xml data)',
      responseData: tokenResponse.data,
      request: {
        url: axiosConfig.url,
        data: axiosConfig.data,
        headers: axiosConfig.headers,
      },
    };
  }

  const ssoResponseDoc = new DOMParser().parseFromString(
    envelope.lastChild.childNodes[0].firstChild.childNodes[0].data,
  );
  const [ssoTicket] = xpath.select('//SSOTicket', ssoResponseDoc);
  if (!ssoTicket?.childNodes?.[0]?.data) {
    throw {
      message: 'Error fetching token (xml data)',
      responseData: tokenResponse.data,
      request: {
        url: axiosConfig.url,
        data: axiosConfig.data,
        headers: axiosConfig.headers,
      },
    };
  }

  return ssoTicket.childNodes[0].data;
}
