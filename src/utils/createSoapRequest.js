export default function createSoapRequest(xml) {
  return `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/">
    <soapenv:Header/>
    <soapenv:Body>
      ${xml}
    </soapenv:Body>
  </soapenv:Envelope>`;
}
