export default function createSoapRequest(xml) {
  return `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header/>
    <soap:Body>
      ${xml}
    </soap:Body>
  </soap:Envelope>`;
}
