export const getConfig = (isSandbox = false) => {
  let url = process.env.DNA_URL;
  if (isSandbox) {
    url = process.env.DNA_SANDBOX_URL;
  }

  const keys = {
    DNA_USER_ID: 'dnaUserId',
    DNA_PASSWORD: 'dnaPassword',
    DNA_APPLICATION_ID: 'dnaApplicationId',
    DNA_NETWORK_NODE_NAME: 'dnaNetworkNodeName',
  };

  const vars = {};
  const missingKeys = [];
  for (const [key, prop] of Object.entries(keys)) {
    const useKey = isSandbox ? key.replace('DNA_', 'DNA_SANDBOX_') : key;
    if (!process.env[useKey]) {
      missingKeys.push(useKey);
    }

    vars[prop] = process.env[useKey];
  }

  if (!url) {
    missingKeys.push(isSandbox ? 'DNA_SANDBOX_URL' : 'DNA_URL');
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
  return { url, vars, missingKeys, ca, cert };
};
