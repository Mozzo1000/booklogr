import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const get = () => {
    return axios.get(getAPIUrl("v1/fields"), { headers: authHeader() });
};

const add = (data) => {
    return axios.post(getAPIUrl("v1/fields"), data, { headers: authHeader() });
};

const edit = (id, data) => {
    return axios.patch(getAPIUrl(`v1/fields/${id}`), data, { headers: authHeader() });
};

const remove = (id) => {
    return axios.delete(getAPIUrl(`v1/fields/${id}`), { headers: authHeader() });
};

const getBookValues = (bookId) => {
    return axios.get(getAPIUrl(`v1/books/${bookId}/field-values`), { headers: authHeader() });
};

const saveBookValues = (bookId, values) => {
    return axios.patch(getAPIUrl(`v1/books/${bookId}/field-values`), values, { headers: authHeader() });
};

export default {
    get,
    add,
    edit,
    remove,
    getBookValues,
    saveBookValues,
};
