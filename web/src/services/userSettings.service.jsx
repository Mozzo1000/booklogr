import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const get = () => {
    return axios.get(API_URL + "v1/settings", { headers: authHeader() });
};

const edit = (data) => {
    return axios.patch(API_URL + "v1/settings", data, { headers: authHeader() });
}

export default {
    get,
    edit,
};