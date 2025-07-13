import React, { useState } from 'react'
import { Avatar, Button, Checkbox, Label, TextInput } from "flowbite-react";
import { RiMailLine } from "react-icons/ri";
import { HR } from "flowbite-react";
import { useTranslation, Trans } from 'react-i18next';

function AccountTab() {
    const [disableSaveButton, setDisableSaveButton] = useState(true);
    const { t } = useTranslation();
    
    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-end">
                <Button disabled={disableSaveButton}>{t("forms.save")}</Button>
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
                    <TextInput id="email1" type="email" placeholder={t("forms.email_placeholder")} icon={RiMailLine} />
                </div>
            </div>

            <HR />

            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="format lg:format-lg dark:format-invert">
                    <h4 >{t("forms.change_password")}</h4>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="password1">{t("forms.old_password")}</Label>
                        <TextInput id="password1" type="password" />
                    </div>

                    <div >
                        <Label htmlFor="password2" value="New password">{t("forms.new_password")}</Label>
                        <TextInput id="password2" type="password" />
                    </div>

                    <div>
                        <Label htmlFor="password3" value="Confirm new password">{t("forms.new_password_confirm")}</Label>
                        <TextInput id="password3" type="password" />
                    </div>

                    <Button>{t("forms.change_password")}</Button>
                    </div>
            </div>
               
        </div>
    )
}

export default AccountTab