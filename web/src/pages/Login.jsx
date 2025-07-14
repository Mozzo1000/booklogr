import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Button, Label, TextInput, Card } from 'flowbite-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { RiMailLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import useToast from '../toast/useToast';
import AnimatedLayout from '../AnimatedLayout';
import { useTranslation, Trans } from 'react-i18next';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();
    const toast = useToast(8000);
    const { t } = useTranslation();

    const isValidGoogleID = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  
    const handleLogin = (e) => {
        e.preventDefault();
        AuthService.login(username, password).then(
            response => {
                toast("success", "Login successful")
                navigate("/")
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

  return (
    <AnimatedLayout>
      <div className="flex flex-col justify-center items-center gap-6">
        <div className="format lg:format-lg dark:format-invert">
          <h2>{t("forms.login_title")}</h2>
        </div>
        {String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true" ? ( 
          <div className="text-center">
            <p className="text-lg font-bold">{t("demo.title")}</p>
            <p>
              <Trans i18nKey="demo.description"
                components={{
                  link_to_info: (
                    <a target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href="https://github.com/Mozzo1000/booklogr"/>
                  )
                }}
              />
            </p>
            <br />
            <p className="font-bold">{t("demo.description_login")}</p>
            <ul>{t("demo.email", {email: "demo@booklogr.app"})}</ul>
            <ul>{t("demo.password", {password: "demo"})}</ul>
          </div>
        ):(
          import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "BL_GOOGLE_ID" &&
            <GoogleLoginButton error={!isValidGoogleID}/>
        )}

        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1">{t("forms.email")}</Label>
              </div>
              <TextInput id="email1" type="email" icon={RiMailLine} placeholder={t("forms.email_placeholder")} required value={username} onChange={e => setUsername(e.target.value)}/>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1">{t("forms.password")}</Label>
              </div>
              <TextInput id="password1" type="password" icon={RiLockPasswordLine} required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit">{t("forms.login")}</Button>
            <Button as={Link} to="/register" color="light" className="hover:bg-gray-100">{t("forms.register_button")}</Button>
          </form>
        </Card>
      </div>
    </AnimatedLayout>
  )
}

export default Login