export default function createSoapRequest(xml) {
  return `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://www.opensolutions.com/">
    <soap:Header/>
    <soap:Body>
      ${xml}
    </soap:Body>
  </soap:Envelope>`;
}
