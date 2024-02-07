import http from "./http";

const env = import.meta.env;
export const constructBaseURL = (appLinkName = null, orgSubDomain = null, excludeApiTopath =  null) => {
  // BaseURL points to given base url (env) or default to domain on which client is running
  // Env variables depend on the environment where app is running, .env.dev for development, .env.prod for production
  // BaseURL will be further modified by webtabs.js by calling this fn again to change
  // the default APIEndpoint to `<appLinkName>/api` once app details are fetched
  let { VITE_FACILIO_PORT, VITE_FACILIO_CONTEXT } = env || {};
  let {
    location: { protocol, hostname, host },
  } = window;
  let rootPathArray = []

  orgSubDomain && rootPathArray.push(orgSubDomain)
  appLinkName && rootPathArray.push(appLinkName)

  if (!excludeApiTopath) rootPathArray.push('api')

  let defaultAPIEndpoint = rootPathArray.join('/')

  let baseURL = `${protocol}//${host}/${defaultAPIEndpoint}`;

  if (env.VITE_BASE_URL) {
    baseURL = `${env.VITE_BASE_URL}/${defaultAPIEndpoint}`;
  } else if (VITE_FACILIO_CONTEXT && VITE_FACILIO_PORT) {
    baseURL = `${protocol}//${hostname}:${VITE_FACILIO_PORT}/${VITE_FACILIO_CONTEXT}/${defaultAPIEndpoint}`;
  }
  return baseURL;
};

export const setBaseURL = (baseURL) => (http.defaults.baseURL = baseURL);

export const getBaseURL = () => http.defaults.baseURL;
