import axios from "axios";
import globalRouter from "../GlobalRouter";
import { getAPIUrl } from "./api.utils";
import authHeader from "./auth-header";

axios.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest.url.includes("/password")) {
        logout();
        globalRouter.navigate("/login");
    }
    return Promise.reject(error)
});

const register = (email, name, password) => {
    return axios.post(getAPIUrl("/v1/register"), {
        email,
        name,
        password,
    });
};

const login = (email, password) => {
    return axios
        .post(getAPIUrl("/v1/login"), {
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
    return axios.post(getAPIUrl("/v1/authorize/google"), {code}).then((response) => {
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
    return axios.post(getAPIUrl("/v1/verify"), {
        email,
        code,
    });
};

const change_password = (current_password, new_password) => {
    return axios.patch(getAPIUrl("/v1/account/password"), {
        current_password,
        new_password,
    }, { headers: authHeader() });
};

const change_email = (new_email) => {
    return axios.patch(getAPIUrl("/v1/account/email"), {
        new_email,
    }, { headers: authHeader() });
};


export default {
    register,
    login,
    logout,
    getCurrentUser,
    verify,
    loginGoogle,
    change_password,
    change_email,
};