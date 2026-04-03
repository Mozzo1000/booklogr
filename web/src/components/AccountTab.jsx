import { useState, useEffect } from 'react'
import { Avatar, Button, Checkbox, Label, TextInput, HelperText } from "flowbite-react";
import { RiMailLine } from "react-icons/ri";
import { HR } from "flowbite-react";
import { useTranslation, Trans } from 'react-i18next';
import useToast from '../toast/useToast';
import AuthService from '../services/auth.service';

function AccountTab() {
    const [disableSaveButton, setDisableSaveButton] = useState(true);
    const [disableChangePasswordButton, setDisableChangePasswordButton] = useState(true);
    const [currentPassword, setCurrentdPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConf, setNewPasswordConf] = useState("");
    const [passwordErrorText, setPasswordErrorText] = useState();
    const [email, setEmail] = useState(AuthService.getCurrentUser().email)
    const [emailErrorText, setEmailErrorText] = useState();

    const { t } = useTranslation();
    const toast = useToast(8000);

    const handleChangePassword = (e) => {
        e.preventDefault();
        AuthService.change_password(currentPassword, newPassword).then(
            response => {
                toast("success", response.data.message)
                setDisableChangePasswordButton(true);
                console.log(response.status)
                if (response.status == 201) {
                    setCurrentdPassword("");
                    setNewPassword("");
                    setNewPasswordConf("");
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

    const handleChangeEmail = () => {
        if (!email.trim()) {
            toast("error", "Email cannot be empty");
            return;
        }
        AuthService.change_email(email).then(
            response => {
                toast("success", response.data.message)
                setDisableSaveButton(true);
                console.log(response.status)
                if (response.status == 201) {
                    const user = AuthService.getCurrentUser();
                    user.email = email;
                    localStorage.setItem("auth_user", JSON.stringify(user));
                    setEmail(email);
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
        if (email !== AuthService.getCurrentUser().email) {
            setDisableSaveButton(false);
        }
        if (!email) {
            setDisableSaveButton(true);
            setEmailErrorText("Email cannot be empty")
        }
        if(email) {
            setEmailErrorText("");
        }
    }, [email])


    useEffect(() => {
        if (newPassword !== newPasswordConf) {
            setPasswordErrorText(t("forms.password_no_match"));
            setDisableChangePasswordButton(true);
        }
        if (!newPassword && !newPasswordConf) {
            setPasswordErrorText("");
        }
        if (newPassword == newPasswordConf) {
            setPasswordErrorText("");
        }
    }, [newPassword, newPasswordConf])

    useEffect(() => {
        if (newPasswordConf === newPassword) {
            if (newPasswordConf && newPassword && currentPassword) {
                setDisableChangePasswordButton(false);
                setPasswordErrorText("")
            }
        }
    }, [currentPassword, newPassword, newPasswordConf, passwordErrorText])
    
    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-end">
                <Button onClick={handleChangeEmail} disabled={disableSaveButton}>{t("forms.save")}</Button>
            </div>

            <div className="flex flex-row items-center justify-between">
                <Avatar size={"lg"} rounded/>
                <div className="flex flex-row gap-4">
                    <Button disabled>{t("forms.upload_picture")}</Button>
                    <Button disabled color="gray">{t("forms.remove")}</Button>
                </div>
                
            </div>
            
            <HR />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>{t("forms.email")}</h4>
                </div>
                <div>
                    <TextInput id="email1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("forms.email_placeholder")} icon={RiMailLine} />
                    {emailErrorText &&
                    <HelperText color="failure">
                        <span className="font-medium">{emailErrorText}</span>
                    </HelperText>
                    }
                </div>
            </div>

            <HR />
            <form onSubmit={handleChangePassword}>
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="format lg:format-lg dark:format-invert">
                        <h4 >{t("forms.change_password")}</h4>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="password1">{t("forms.old_password")}</Label>
                            <TextInput id="password1" type="password" value={currentPassword} onChange={(e) => setCurrentdPassword(e.target.value)}/>
                        </div>

                        <div >
                            <Label htmlFor="password2" value="New password">{t("forms.new_password")}</Label>
                            <TextInput id="password2" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        </div>

                        <div>
                            <Label htmlFor="password3" value="Confirm new password">{t("forms.new_password_confirm")}</Label>
                            <TextInput id="password3" type="password" value={newPasswordConf} onChange={(e) => setNewPasswordConf(e.target.value)}/>
                            {passwordErrorText &&
                            <HelperText color="failure">
                                <span className="font-medium">{passwordErrorText}</span>
                            </HelperText>
                            }

                        </div>
                        <Button type="submit" disabled={disableChangePasswordButton} >{t("forms.change_password")}</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AccountTab