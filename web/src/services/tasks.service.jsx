import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const create = (type, data) => {
    return axios.post(getAPIUrl("v1/tasks"), {type, data}, { headers: authHeader() });
};

const get = (id) => {
    return axios.get(getAPIUrl(`v1/tasks/${id}`), { headers: authHeader() });
};

export default {
    create,
    get,
};