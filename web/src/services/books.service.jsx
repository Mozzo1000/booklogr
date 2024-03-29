import axios from "axios";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const add = (data) => {
    return axios.post(API_URL + "v1/books", data)
};

const get = (status) => {
    if (status) {
        return axios.get(API_URL + "v1/books?status=" + status)

    } else {
        return axios.get(API_URL + "v1/books")

    }
}

const edit = (id, data) => {
    return axios.patch(API_URL + "v1/books/" + id, data);
};

export default {
    add,
    get,
    edit,
};