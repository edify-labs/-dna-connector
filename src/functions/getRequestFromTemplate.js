const {
  DNA_USER_ID,
  DNA_PASSWORD,
  DNA_APPLICATION_ID,
  DNA_NETWORK_NODE,
} = process.env;

export default function getRequest(dnaRequest) {
  return `
    <Transaction>
      <Input>
          <UserAuthentication>
              <UserId>${DNA_USER_ID}</UserId>
              <Passwd>${DNA_PASSWORD}</Passwd>
              <ApplID>${DNA_APPLICATION_ID}</ApplID>
              <NtwkNodeName>${DNA_NETWORK_NODE}</NtwkNodeName>
          </UserAuthentication>
          <Requests>
              ${dnaRequest}
          </Requests>
      </Input>
    </Transaction>
  `;
}