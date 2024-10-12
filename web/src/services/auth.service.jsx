import axios from "axios";
import globalRouter from "../GlobalRouter";

const API_URL = import.meta.env.VITE_AUTH_API_URL;

axios.interceptors.response.use(response => {
    return response;
 }, error => {
   if (error.response.status === 401) {
    logout();
    globalRouter.navigate("/login")
   }
   return error;
 });

const register = (email, name, password) => {
    return axios.post(API_URL + "/v1/register", {
        email,
        name,
        password,
    });
};

const login = (email, password) => {
    return axios
        .post(API_URL + "/v1/login", {
            email,
            password,
        })
        .then((response) => {
            if (response.data.access_token) {
                localStorage.setItem("auth_user", JSON.stringify(response.data));
            }

            return response.data;
        });
};

const loginGoogle = (code) => {
    return axios.post(API_URL + "/v1/authorize/google", {code}).then((response) => {
        if (response.data.access_token) {
            localStorage.setItem("auth_user", JSON.stringify(response.data));
        }
        return response.data
    })
}

const logout = () => {
    /*TODO: Send logout request to auth-server so the token get invalidated. */
    localStorage.removeItem("auth_user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("auth_user"));
};

const verify = (email, code) => {
    return axios.post(API_URL + "/v1/verify", {
        email,
        code,
    });
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
    verify,
    loginGoogle,
};