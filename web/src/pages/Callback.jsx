import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../services/auth.service';
import useToast from '../toast/useToast';

function Callback() {
    const navigate = useNavigate();
    const toast = useToast(4000);
    const [searchParams] = useSearchParams();
    const hasCalledBackend = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");

        if (code && !hasCalledBackend.current) {
            hasCalledBackend.current = true;
            console.log("Passing code to backend...");

            AuthService.loginOIDC({ code: code })
                .then(() => {
                    toast("success", "Login successful");
                    navigate("/library");
                })
                .catch((err) => {
                    console.error("Backend Code Exchange Failed:", err);
                    toast("error", "Authentication failed at backend");
                    navigate("/login");
                });
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Authorizing with server...</p>
        </div>
    );
}

export default Callback;