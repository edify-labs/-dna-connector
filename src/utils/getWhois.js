import moment from 'moment';
import xpath from 'xpath';
import fs from 'fs';
import axios from 'axios';
import https from 'https';
import { randomBytes } from 'crypto';
import { DOMParser } from 'xmldom';
import { getConfig } from '../constants';
import { writeToErrorFile, getSsoTicket } from '.';

let existingWhois;

export default async function getWhois(isSandbox = false) {
  if (existingWhois) {
    return existingWhois;
  }

  const ssoTicket = await getSsoTicket(isSandbox);
  const xsd = moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSSSZ');
  const trackingId = randomBytes(8).toString('hex');
  const config = getConfig(isSandbox);
  console.log(`SSO TICKET\n------------------\n${ssoTicket}`);
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/">
     <soapenv:Header/>
     <soapenv:Body>
        <open:WhoIs>
           <open:xmlRequest>
              <![CDATA[<WhoIsRequest MessageDateTime="${xsd}" TrackingId="${trackingId}" SSOTicket="${ssoTicket}">
                  <LookupSSOTicket>${ssoTicket}</LookupSSOTicket>
              </WhoIsRequest>]]>
           </open:xmlRequest>
        </open:WhoIs>
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
      SOAPAction: `http://www.opensolutions.com/WhoIs`,
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

  existingWhois = envelope.lastChild.childNodes[0].firstChild.childNodes[0].data.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    '',
  );

  // // tokens last for 24h
  // // clear out after 23h for some leeway
  setTimeout(() => {
    existingWhois = null;
  }, 23 * 60 * 60 * 1000);

  return existingWhois;
}
