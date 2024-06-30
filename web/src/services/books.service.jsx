import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const add = (data) => {
    return axios.post(API_URL + "v1/books", data, { headers: authHeader() })
};

const get = (status) => {
    if (status) {
        return axios.get(API_URL + "v1/books?status=" + status, { headers: authHeader() })

    } else {
        return axios.get(API_URL + "v1/books", { headers: authHeader() })

    }
}

const edit = (id, data) => {
    return axios.patch(API_URL + "v1/books/" + id, data, { headers: authHeader() });
};

export default {
    add,
    get,
    edit,
};