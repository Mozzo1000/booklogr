import axios from "axios";

const API_URL = import.meta.env.VITE_API_ENDPOINT;

const add = (data) => {
    return axios.post(API_URL + "v1/books", data)
};

export default {
    add,
};