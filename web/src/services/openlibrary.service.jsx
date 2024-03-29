import axios from "axios";

const API_URL = "https://openlibrary.org";

const get = (id) => {
    return axios.get(API_URL + "/api/books?bibkeys=ISBN:" + id + "&jscmd=data&format=json", { })
};

export default {
    get,
};