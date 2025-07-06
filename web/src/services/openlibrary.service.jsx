import axios from "axios";

const API_URL = "https://openlibrary.org";

const get = (id) => {
    return axios.get(API_URL + "/search.json?isbn=" + id + "&fields=key,title,author_name,number_of_pages_median,first_publish_year,cover_edition_key,isbn", { })
};

const getWorks = (id) => {
    return axios.get(API_URL + id + ".json", { })
}

const getEditions = (work_id, limit=10, offset=0) => {
    return axios.get(API_URL + work_id + "/editions.json?limit=" + limit + "&offset=" + offset)
}

export default {
    get,
    getWorks,
    getEditions
};