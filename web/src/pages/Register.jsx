import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Button, Label, TextInput, Card } from 'flowbite-react';
import { RiMailLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import { RiUser3Line } from "react-icons/ri";
import useToast from '../toast/useToast';
import AnimatedLayout from '../AnimatedLayout';
import { useTranslation, Trans } from 'react-i18next';

function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConf, setPasswordConf] = useState("");
    const [passwordErrorText, setPasswordErrorText] = useState();
    const [registerButtonDisabled, setRegisterButtonDisabled] = useState(true);
    const { t } = useTranslation();

    let navigate = useNavigate();
    const toast = useToast(8000);
    const isRegistrationAllowed = import.meta.env.VITE_ALLOW_REGISTRATION !== "false";

    useEffect(() => {
        if (!isRegistrationAllowed) {
            navigate("/login");
        }
        if (AuthService.getCurrentUser()) {
            navigate("/library");
        }
    }, [isRegistrationAllowed, navigate]);

    const handleRegistration = (e) => {
        e.preventDefault();
        AuthService.register(email, name, password).then(
            response => {
              toast("success", response.data.message)
              if (response.data.status === "verified") {
                navigate("/login", {state: {"email": email}})
              }else if (response.data.status === "unverified") {
                navigate("/verify", {state: {"email": email}})
              }
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
    }

    useEffect(() => {
      if (passwordConf !== password) {
          setPasswordErrorText(t("form.password_no_match"));
          setRegisterButtonDisabled(true);
      }
      if (!password && !passwordConf) {
          setPasswordErrorText("");
      }
      if (password == passwordConf) {
        setPasswordErrorText("");
      }
    }, [password, passwordConf])

    useEffect(() => {
        if (passwordConf === password) {
            if (passwordConf && password && email && name) {
                setRegisterButtonDisabled(false);
                setPasswordErrorText("")
            }
        }
    }, [password, passwordConf, email, name, passwordErrorText])


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
                        {t("forms.register_title")}
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <Card className="rounded-lg border shadow-md">
                        <form className="flex flex-col gap-3" onSubmit={handleRegistration}>
                            <div>
                                <Label htmlFor="email1" className="mb-2 block">{t("forms.email")}</Label>
                                <TextInput id="email1" type="email" icon={RiMailLine} placeholder={t("forms.email_placeholder")} required value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="name" className="mb-2 block">{t("forms.name")}</Label>
                                <TextInput id="name" type="text" icon={RiUser3Line} required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="password1" className="mb-2 block">{t("forms.password")}</Label>
                                <TextInput id="password1" type="password" icon={RiLockPasswordLine} required value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="password2" className="mb-2 block">{t("forms.confirm_password")}</Label>
                                <TextInput id="password2" type="password" icon={RiLockPasswordLine} required value={passwordConf} onChange={e => setPasswordConf(e.target.value)} color={passwordErrorText ? 'failure' : 'gray'} helperText={passwordErrorText} />
                            </div>
                            
                            <Button type="submit" className="mt-2 shadow-sm rounded-lg" disabled={registerButtonDisabled}>
                                {t("forms.register")}
                            </Button>

                            <Button as={Link} to="/login" color="light">
                                {t("forms.back_to_login")}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </AnimatedLayout>
    );
}

export default Register