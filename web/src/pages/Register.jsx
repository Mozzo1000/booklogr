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
      <div className="flex flex-col justify-center items-center gap-6">
        <div className="format lg:format-lg dark:format-invert">
          <h2>{t("forms.register_title")}</h2>
        </div>
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleRegistration}>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1">{t("forms.email")}</Label>
              </div>
              <TextInput id="email1" type="email" icon={RiMailLine} placeholder={t("forms.email_placeholder")} required value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name">{t("forms.name")}</Label>
              </div>
              <TextInput id="name" type="text" icon={RiUser3Line} required value={name} onChange={e => setName(e.target.value)}/>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1">{t("forms.password")}</Label>
              </div>
              <TextInput id="password1" type="password" icon={RiLockPasswordLine} required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <div className="mb-2 block">
                  <Label htmlFor="password2">{t("forms.confirm_password")}</Label>
                </div>
                <TextInput id="password2" type="password" icon={RiLockPasswordLine} required value={passwordConf} onChange={e => setPasswordConf(e.target.value)} color={passwordErrorText ? 'failure' : 'gray'} helperText={passwordErrorText} />
            </div>
            <Button type="submit" disabled={registerButtonDisabled} >{t("forms.register")}</Button>
          </form>
        </Card>
      </div>
    </AnimatedLayout>
  )
}

export default Register