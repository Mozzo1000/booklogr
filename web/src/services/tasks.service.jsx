import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const create = (type, data) => {
    return axios.post(API_URL + "v1/tasks", {type, data}, { headers: authHeader() });
};

export default {
    create,
};