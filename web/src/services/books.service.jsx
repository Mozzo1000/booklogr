import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const add = (data) => {
    return axios.post(getAPIUrl("v1/books"), data, { headers: authHeader() })
};

const get = (status, sort, order, page) => {
    if (status) {
        return axios.get(getAPIUrl(`v1/books?status=${status}&sort_by=${sort}&order=${order}&offset=${page}`), { headers: authHeader() })

    } else {
        return axios.get(API_URL + "v1/books", { headers: authHeader() })

    }
}

const edit = (id, data) => {
    return axios.patch(getAPIUrl(`v1/books/${id}`), data, { headers: authHeader() });
};

const remove = (id) => {
    return axios.delete(getAPIUrl(`v1/books/${id}`), { headers: authHeader() });
};

const notes = (id) => {
    return axios.get(getAPIUrl(`v1/books/${id}/notes`), { headers: authHeader() })
};

const addNote = (id, data) => {
    return axios.post(getAPIUrl(`v1/books/${id}/notes`), data, { headers: authHeader() })
};

const status = (isbn) => {
    return axios.get(getAPIUrl(`v1/books/${isbn}`), {headers: authHeader() })
}

export default {
    add,
    get,
    edit,
    remove,
    notes,
    addNote,
    status,
};