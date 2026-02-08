import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const edit = (id, data) => {
    return axios.patch(getAPIUrl(`v1/notes/${id}`), data, { headers: authHeader() });
};

const remove = (id) => {
    return axios.delete(getAPIUrl(`v1/notes/${id}`), { headers: authHeader() });
};

export default {
    edit,
    remove,
};