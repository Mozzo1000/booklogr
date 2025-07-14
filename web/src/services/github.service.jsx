import axios from "axios";

const API_URL = "https://api.github.com/";

const getLatestRelease = () => {
    return axios.get(API_URL + "repos/mozzo1000/booklogr/releases/latest", { headers:  {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}})
}


export default {
    getLatestRelease
};