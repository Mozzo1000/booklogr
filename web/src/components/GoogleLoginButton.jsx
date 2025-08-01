import React, {useState} from 'react'
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Button, Popover } from 'flowbite-react';
import AuthService from '../services/auth.service';
import { Spinner } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function GoogleLoginButton(props) {
    let navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleLoginGoogle = useGoogleLogin(
    {
        flow: 'auth-code',
        ux_mode: 'popup',
        onSuccess: (codeResponse) => {
            AuthService.loginGoogle(codeResponse.code).then(
            response => {
                setLoading(false);
                navigate("/")
            },
            error => {
                setLoading(false);
            }
        )
        },
        onNonOAuthError: () => {
            setLoading(false);
        }
    });

    const googleButton = (
        <Button disabled={props.error} color="light" onClick={() => (handleLoginGoogle(), setLoading(true))}>
        <svg version="1.1" className="roboto-medium h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
        {t("forms.google_sign_in")}
        {props.error &&

            <span>⚠️</span>
        }
        </Button>
    );

    const displayPopoverContent = (
        <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("help.google_client_id_error.title")}</h3>
            </div>
            <div className="px-3 py-2">

                <p>
                    <Trans i18nKey="help.google_client_id_error.description"
                        components={{
                            link_to_info: (
                                <a target="_blank" href="https://booklogr.app/docs/Configuration/Google-sign-in" className="mt-2 inline-block text-blue-600 underline hover:text-blue-800" />
                            )
                    }}
                    />
                </p>
            </div>
        </div>
    )

    return (
        <>
        {loading ? (
            <Button color="light">
                <Spinner/>
            </Button>
        ): (
            props.error ? (
                <Popover placement='top' content={displayPopoverContent} trigger="hover">
                    <div>
                        {googleButton}
                    </div>
                </Popover>
            ):(
                googleButton
            )
            
        )}
                
      </>

    )
}

export default GoogleLoginButton