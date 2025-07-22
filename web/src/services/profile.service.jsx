import axios from "axios";
import authHeader from "./auth-header";
import { getAPIUrl } from "./api.utils";

const create = (data) => {
    return axios.post(getAPIUrl("v1/profiles"), data, { headers: authHeader() })
};

const get_by_display_name = (display_name) => {
    return axios.get(getAPIUrl(`v1/profiles/${display_name}`))
}

const get = () => {
    return axios.get(getAPIUrl("v1/profiles"), { headers: authHeader() });
};

const edit = (data) => {
    return axios.patch(getAPIUrl("v1/profiles"), data, { headers: authHeader() });
}

export default {
    create,
    get,
    get_by_display_name,
    edit,
};