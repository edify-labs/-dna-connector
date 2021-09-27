import xpath from 'xpath';
import fs from 'fs';
import axios from 'axios';
import https from 'https';
import { randomBytes } from 'crypto';
import { DOMParser } from 'xmldom';
import { getConfig } from '../constants';
import createSoapRequest from './createSoapRequest';
import { writeToErrorFile } from '.';

let existingToken;

export default async function getSsoToken(isSandbox = false) {
  if (existingToken) {
    return existingToken;
  }

  const date = new Date();
  const xsd = `${date.toISOString()}${date.getTimezoneOffset() / 60}:00`;
  const trackingId = randomBytes(8).toString('hex');
  const config = getConfig(isSandbox);
  // const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
  // <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/">
  //   <soapenv:Header/>
  //   <soapenv:Body>
  //     <open:DirectSignon>
  //       <open:xmlRequest>
  //         <![CDATA[<DirectSSORequest MessageDateTime="${xsd}" TrackingId="${trackingId}">
  //           <DeviceId>${config.vars?.dnaNetworkNodeName}</DeviceId>
  //           <UserId>${config.vars?.dnaUserId}</UserId>
  //           <Password>${config.vars?.dnaPassword}</Password>
  //           <ProdEnvCd>${config.vars?.dnaEnvironment}</ProdEnvCd>
  //           <ProdDefCd>${config.vars?.dnaDefCode}</ProdDefCd>
  //         </DirectSSORequest>]]>
  //       </open:xmlRequest>
  //   </open:DirectSignon>
  //   </soapenv:Body>
  // </soapenv:Envelope>`;

  // const xmlBody = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/"><soapenv:Header/><soapenv:Body><open:DirectSignon><open:xmlRequest><![CDATA[<DirectSSORequest MessageDateTime="${xsd}" TrackingId="${trackingId}"><DeviceId>${config.vars?.dnaNetworkNodeName}</DeviceId><UserId>${config.vars?.dnaUserId}</UserId><Password>${config.vars?.dnaPassword}</Password><ProdEnvCd>${config.vars?.dnaEnvironment}</ProdEnvCd><ProdDefCd>${config.vars?.dnaDefCode}</ProdDefCd></DirectSSORequest>]]></open:xmlRequest></open:DirectSignon></soapenv:Body></soapenv:Envelope>`;
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/"><soapenv:Header/><soapenv:Body><open:DirectSignon><open:xmlRequest><DirectSSORequest MessageDateTime="${xsd}" TrackingId="${trackingId}"><DeviceId>${config.vars?.dnaNetworkNodeName}</DeviceId><UserId>${config.vars?.dnaUserId}</UserId><Password>${config.vars?.dnaPassword}</Password><ProdEnvCd>${config.vars?.dnaEnvironment}</ProdEnvCd><ProdDefCd>${config.vars?.dnaDefCode}</ProdDefCd></DirectSSORequest></open:xmlRequest></open:DirectSignon></soapenv:Body></soapenv:Envelope>`;
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
  const xmldoc = new DOMParser().parseFromString(tokenResponse.data);
  const [node] = xpath.select('//SSOTicket', xmldoc);
  if (!node || !node.firstChild || !node.firstChild.data) {
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

  existingToken = node.firstChild.data;

  // tokens last for 24h
  // clear out after 23h for some leeway
  setTimeout(() => {
    existingToken = null;
  }, 23 * 60 * 60 * 1000);

  return existingToken;
}
