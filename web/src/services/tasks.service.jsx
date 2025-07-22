import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const create = (type, data) => {
    return axios.post(getAPIUrl("v1/tasks"), {type, data}, { headers: authHeader() });
};

export default {
    create,
};