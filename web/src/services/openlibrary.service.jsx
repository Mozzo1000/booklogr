import axios from "axios";

const API_URL = "https://openlibrary.org";

const get = (id) => {
    return axios.get(API_URL + "/search.json?isbn=" + id + "&fields=key,title,author_name,number_of_pages_median,first_publish_year,cover_edition_key,isbn", { })
};

const getWorks = (id) => {
    return axios.get(API_URL + id + ".json", { })
}

export default {
    get,
    getWorks,
};