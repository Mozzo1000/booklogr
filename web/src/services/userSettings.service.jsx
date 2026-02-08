import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const get = () => {
    return axios.get(getAPIUrl("v1/settings"), { headers: authHeader() });
};

const edit = (data) => {
    return axios.patch(getAPIUrl("v1/settings"), data, { headers: authHeader() });
}

export default {
    get,
    edit,
};