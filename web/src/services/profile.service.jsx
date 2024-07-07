import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const create = (data) => {
    return axios.post(API_URL + "v1/profiles", data, { headers: authHeader() })
};

const get_by_display_name = (display_name) => {
    return axios.get(API_URL + "v1/profiles/" + display_name)
}

const get = () => {
    return axios.get(API_URL + "v1/profiles", { headers: authHeader() });
};

const edit = (data) => {
    return axios.patch(API_URL + "v1/profiles", data, { headers: authHeader() });
}

export default {
    create,
    get,
    get_by_display_name,
    edit,
};