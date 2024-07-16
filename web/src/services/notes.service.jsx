import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const edit = (id, data) => {
    return axios.patch(API_URL + "v1/notes/" + id, data, { headers: authHeader() });
};

const remove = (id) => {
    return axios.delete(API_URL + "v1/notes/" + id, { headers: authHeader() });
};

export default {
    edit,
    remove,
};