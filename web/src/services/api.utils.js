export const createAPIUrl = (baseUrl) => (endpoint) => {
    let apiEndpoint = baseUrl;
    // trim trailing slash if it exists
    if (apiEndpoint.endsWith("/")) {
        apiEndpoint = apiEndpoint.slice(0, -1);
    }

    return new URL(endpoint, apiEndpoint).toString();
};

export const getAPIUrl = createAPIUrl(import.meta.env?.VITE_API_ENDPOINT || 'http://localhost:5000');