export const getConfig = (isSandbox = false) => {
  const urls = {};
  urls.coreJson = process.env.DNA_URL_JSON;
  if (isSandbox) {
    urls.coreJson = process.env.DNA_SANDBOX_URL_JSON;
  }

  urls.coreSoap = process.env.DNA_URL_SOAP;
  if (isSandbox) {
    urls.coreSoap = process.env.DNA_SANDBOX_URL_SOAP;
  }

  urls.saf = process.env.DNA_SAF_URL;
  if (isSandbox && process.env.DNA_SANDBOX_SAF_URL) {
    urls.saf = process.env.DNA_SANDBOX_SAF_URL;
  }

  const keys = {
    DNA_USER_ID: 'dnaUserId',
    DNA_PASSWORD: 'dnaPassword',
    DNA_APPLICATION_ID: 'dnaApplicationId',
    DNA_NETWORK_NODE_NAME: 'dnaNetworkNodeName',
    DNA_DEF_CODE: 'dnaDefCode',
    DNA_ENVIRONMENT: 'dnaEnvironment',
  };

  const vars = {};
  const missingKeys = [];
  for (const [key, prop] of Object.entries(keys)) {
    const useKey = isSandbox ? key.replace('DNA_', 'DNA_SANDBOX_') : key;
    if (!process.env[useKey]) {
      missingKeys.push(useKey);
    } else {
      vars[prop] = process.env[useKey].trim();
    }
  }

  const ca =
    isSandbox && process.env.DNA_SANDBOX_INTERMEDIATE_CERT
      ? process.env.DNA_SANDBOX_INTERMEDIATE_CERT
      : process.env.DNA_INTERMEDIATE_CERT;
  const cert =
    isSandbox && process.env.DNA_SANDBOX_ROOT_CERT
      ? process.env.DNA_SANDBOX_ROOT_CERT
      : process.env.DNA_ROOT_CERT;

  if (!ca) {
    missingKeys.push(
      isSandbox && process.env.DNA_SANDBOX_INTERMEDIATE_CERT
        ? 'DNA_SANDBOX_INTERMEDIATE_CERT'
        : 'DNA_INTERMEDIATE_CERT',
    );
  }

  if (!cert) {
    missingKeys.push(
      isSandbox && process.env.DNA_SANDBOX_ROOT_CERT ? 'DNA_SANDBOX_ROOT_CERT' : 'DNA_ROOT_CERT',
    );
  }

  return { urls, vars, missingKeys, ca, cert };
};
