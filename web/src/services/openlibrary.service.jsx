import axios from "axios";

const API_URL = "https://openlibrary.org";

const get = (id) => {
    return axios.get(API_URL + "/isbn/" + id + ".json")
};

const getWorks = (id) => {
    return axios.get(API_URL + id + ".json", { })
}

const getEditions = (work_id, limit=10, offset=0) => {
    return axios.get(API_URL + work_id + "/editions.json?limit=" + limit + "&offset=" + offset)
}

const getAuthor = (author_id) => {
    return axios.get(API_URL + author_id + ".json")
}

export default {
    get,
    getWorks,
    getEditions,
    getAuthor,
};