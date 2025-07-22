export const getAPIUrl = (endpoint) => {
    return new URL(endpoint, import.meta.env.VITE_API_ENDPOINT).toString();
};