import React, { useState } from 'react'
import { Avatar, Button, Checkbox, Label, TextInput } from "flowbite-react";
import { RiMailLine } from "react-icons/ri";
import { HR } from "flowbite-react";

function AccountTab() {
    const [disableSaveButton, setDisableSaveButton] = useState(true);
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-row justify-end">
                <Button disabled={disableSaveButton}>Save</Button>
            </div>

            <div className="flex flex-row items-center justify-between">
                <Avatar size={"lg"} rounded/>
                <div className="flex flex-row gap-4">
                    <Button disabled>Upload picture</Button>
                    <Button disabled color="gray">Remove</Button>
                </div>
                
            </div>
            
            <HR />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg">
                    <h4>Email</h4>
                </div>
                <div>
                    <TextInput id="email1" type="email" placeholder="name@flowbite.com" icon={RiMailLine} />
                </div>
            </div>

            <HR />

            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="format lg:format-lg">
                    <h4 >Change password</h4>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="password1">Old password</Label>
                        <TextInput id="password1" type="password" />
                    </div>

                    <div >
                        <Label htmlFor="password2" value="New password">New password</Label>
                        <TextInput id="password2" type="password" />
                    </div>

                    <div>
                        <Label htmlFor="password3" value="Confirm new password">Confirm new password</Label>
                        <TextInput id="password3" type="password" />
                    </div>

                    <Button>Change password</Button>
                    </div>
            </div>
               
        </div>
    )
}

export default AccountTab