import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Button, Label, TextInput, Card } from 'flowbite-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { RiMailLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import { RiShieldUserLine } from "react-icons/ri";
import useToast from '../toast/useToast';
import AnimatedLayout from '../AnimatedLayout';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from "react-oidc-context";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();
    const toast = useToast(8000);
    const { t } = useTranslation();
    const auth = useAuth();

    const isManualLoginAllowed = import.meta.env.VITE_ALLOW_MANUAL_LOGIN !== "false";
    const isRegistrationAllowed = import.meta.env.VITE_ALLOW_REGISTRATION !== "false";
    const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    const hasOIDC = !!(import.meta.env.VITE_OIDC_AUTHORITY?.trim() && import.meta.env.VITE_OIDC_CLIENT_ID?.trim());
    const isValidGoogleID = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(import.meta.env.VITE_GOOGLE_CLIENT_ID);

    useEffect(() => {
        if(AuthService.getCurrentUser()) {
            return navigate("/library")
        }
    }, [])

    const handleLogin = (e) => {
        e.preventDefault();
        AuthService.login(username, password).then(
            response => {
                toast("success", "Login successful")
                navigate("/library")
            },
            error => {
              const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
              toast("error", resMessage);
            }
        )
    };
    
    function DemoAdditionalContent({ t }) {
      const [copiedEmail, setCopiedEmail] = useState(false);
      const [copiedPass, setCopiedPass] = useState(false);

      const copyToClipboard = (text, setCopied) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <>
          <div className="mb-4 mt-2 text-base">
            {t("demo.description")}
          </div>
          <div className="space-y-4 border-t border-blue-200 dark:border-blue-800 pt-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{t("forms.email")}</span>
                <div>
                  <code className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">demo@booklogr.app</code>
                </div>
              </div>
              <Button 
                size="xs" color="light" onClick={() => copyToClipboard("demo@booklogr.app", setCopiedEmail)}>
                {copiedEmail ? <RiCheckLine className="h-4 w-4 text-green-500" /> : <RiFileCopyLine className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{t("forms.password")}</span>
                <div>
                  <code className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">demo</code>
                </div>
              </div>
              <Button size="xs" color="light" onClick={() => copyToClipboard("demo", setCopiedPass)}>
                {copiedPass ? <RiCheckLine className="h-4 w-4 text-green-500" /> : <RiFileCopyLine className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      );
    }

    return (
        <AnimatedLayout>
            <div className="flex flex-col min-h-[calc(100vh-140px)] items-center justify-center px-4 py-4">                
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center mb-1">
                        <img src="/icon.svg" className="mr-3 h-8 sm:h-10" alt="BookLogr Logo" />
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                            BookLogr
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {t("forms.login_title")}
                    </p>
                </div>

                <div className="w-full max-w-md">
                    {import.meta.env.VITE_DEMO_MODE?.trim() === "true" && (
                        <Alert color="info" icon={RiInformationLine} className="mb-6 shadow-sm rounded-lg" additionalContent={<DemoAdditionalContent t={t} />}>
                            <span className="font-bold uppercase tracking-wide text-xs">
                                {t("demo.title")}
                            </span>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-2">
                        {hasGoogle && (
                          <GoogleLoginButton error={!isValidGoogleID} />
                        )}
                        {hasOIDC && (
                            <Button color="light" onClick={() => auth.signinRedirect()}>
                                <RiShieldUserLine className="mr-2 h-5 w-5" />
                                {t("forms.oidc_sign_in")}
                            </Button>
                        )}
                    </div>

                    {isManualLoginAllowed && (hasGoogle || hasOIDC) && (
                        <div className="relative flex py-5 items-center">
                            <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
                            <span className="shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                {t("forms.or")}
                            </span>
                            <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                    )}

                    {isManualLoginAllowed && (
                        <Card className="rounded-lg border shadow-md">
                            <form className="flex flex-col gap-3" onSubmit={handleLogin}>
                                <div>
                                    <Label htmlFor="email1" className="mb-2 block ">{t("forms.email")}</Label>
                                    <TextInput id="email1" type="email" icon={RiMailLine} placeholder={t("forms.email_placeholder")} required value={username} onChange={e => setUsername(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="password1" className="mb-2 block">{t("forms.password")}</Label>
                                    <TextInput id="password1" type="password" icon={RiLockPasswordLine} required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                
                                <Button type="submit">
                                    {t("forms.login")}
                                </Button>

                                {isRegistrationAllowed && (
                                    <Button as={Link} to="/register" color="light">
                                        {t("forms.register_button")}
                                    </Button>
                                )}
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </AnimatedLayout>
    );
}

export default Login