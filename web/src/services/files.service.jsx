import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const get = (filename) => {
    return axios.get(API_URL + "v1/files/" + filename, { responseType: "blob", headers: authHeader() });
};

const getAll = () => {
    return axios.get(API_URL + "v1/files", { headers: authHeader() });
};

const upload = (formData) => {
    return axios.post(API_URL + "v1/files", formData, { headers: Object.assign({}, authHeader(), {"Content-Type": "multipart/form-data"}) });
};


export default {
    get,
    getAll,
    upload,
};