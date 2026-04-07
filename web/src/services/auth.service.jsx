import axios from "axios";
import globalRouter from "../GlobalRouter";
import { getAPIUrl } from "./api.utils";
import { authRefreshHeader } from "./auth-header";
import authHeader from "./auth-header";

const refreshInstance = axios.create();

axios.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && error.response.data?.msg === "Token has expired" && !originalRequest.url.includes("/password") && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const response = await refreshInstance.post(getAPIUrl("/v1/token/refresh"),{}, { headers: authRefreshHeader() });
            const { access_token, refresh_token } = response.data;
            
            const user = JSON.parse(localStorage.getItem("auth_user"));
            localStorage.setItem("auth_user", JSON.stringify({
                ...user,
                access_token,
                refresh_token
            }));

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axios(originalRequest);

        } catch (err) {
            localStorage.removeItem("auth_user");
            globalRouter.Navigate("/login")
            return Promise.reject(err);
        }
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

const logout = async () => {
    const authUser = JSON.parse(localStorage.getItem("auth_user"));    
    if (authUser) {
        const { access_token, refresh_token } = authUser;

        try {
            await Promise.allSettled([
                axios.post(getAPIUrl("/v1/token/logout/access"), {}, {
                    headers: { Authorization: `Bearer ${access_token}` }
                }),

                axios.post(getAPIUrl("/v1/token/logout/refresh"), {}, {
                    headers: { Authorization: `Bearer ${refresh_token}` }
                })
            ]);
        } catch (error) {
            console.error("Logout requests failed", error);
        }
    }
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