import React, { useState } from 'react'
import { Avatar, Button, Checkbox, Label, TextInput } from "flowbite-react";
import { RiMailLine } from "react-icons/ri";

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
            
            <hr />

            <div className="flex flex-col gap-4 max-w-lg">
                <div className="format lg:format-lg">
                    <h3 >Login email</h3>
                </div>
                <div>
                    <Label htmlFor="email1" value="Email" />
                    <TextInput id="email1" type="email" placeholder="name@flowbite.com" icon={RiMailLine} />
                </div>
            </div>

            <hr />

            <div className="flex flex-col gap-4 max-w-lg">
                <div className="format lg:format-lg">
                    <h3 >Change password</h3>
                </div>
                <div>
                    <Label htmlFor="password1" value="Old password" />
                    <TextInput id="password1" type="password" />
                </div>

                <div >
                    <Label htmlFor="password2" value="New password" />
                    <TextInput id="password2" type="password" />
                </div>

                <div>
                    <Label htmlFor="password3" value="Confirm new password" />
                    <TextInput id="password3" type="password" />
                </div>

                <Button>Change password</Button>
            </div>
               
        </div>
    )
}

export default AccountTab