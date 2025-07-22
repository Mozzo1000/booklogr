import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const get = (filename) => {
    return axios.get(getAPIUrl(`v1/files/${filename}`), { responseType: "blob", headers: authHeader() });
};

const getAll = () => {
    return axios.get(getAPIUrl("v1/files"), { headers: authHeader() });
};

const upload = (formData) => {
    return axios.post(getAPIUrl("v1/files"), formData, { headers: Object.assign({}, authHeader(), {"Content-Type": "multipart/form-data"}) });
};


export default {
    get,
    getAll,
    upload,
};