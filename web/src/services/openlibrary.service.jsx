import axios from "axios";

const API_URL = "https://openlibrary.org";

const get = (id) => {
    return axios.get(API_URL + "/isbn/" + id + ".json", { })
};

export default {
    get,
};