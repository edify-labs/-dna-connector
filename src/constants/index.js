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
    missingKeys.push(isSandbox ? 'DNA_URL' : 'DNA_SANDBOX_URL');
  }

  return { url, vars, missingKeys };
};
