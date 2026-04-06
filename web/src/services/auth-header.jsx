export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('auth_user'));

    if (user && user.access_token) {
        return { Authorization: 'Bearer ' + user.access_token };
    } else {
        return {};
    }
}

export function authRefreshHeader() {
    const user = JSON.parse(localStorage.getItem('auth_user'));

    if (user && user.refresh_token) {
        return { Authorization: 'Bearer ' + user.refresh_token };
    } else {
        return {};
    }
}