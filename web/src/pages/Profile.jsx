import React, { useEffect, useState } from 'react'
import ProfileService from '../services/profile.service';
import { Button, TextInput, Label} from "flowbite-react";
import useToast from '../toast/useToast';

function Profile() {
    const [data, setData] = useState();
    const [noProfile, setNoProfile] = useState();
    const [createDisplayName, setCreateDisplayName] = useState();
    const toast = useToast(4000);

    useEffect(() => {
        ProfileService.get().then(
            response => {
                console.log(response.data)
                setData(response.data)
                setNoProfile(false);
            },
            error => {
                if (error.response) {
                    console.log(error.response.status)
                    if (error.response.status == 404) {
                        console.log("¤=¤")
                        setNoProfile(true);
                    }
                }
            }
        )
    }, [])

    const handleCreateProfile = (e) => {
        e.preventDefault();
        ProfileService.create({"display_name": createDisplayName}).then(
            response => {
                toast("success", response.data.message);
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
        <div>Profile

            {noProfile &&
                <>
                <h1>Create profile</h1>
                <form className="flex max-w-md flex-col gap-4" onSubmit={handleCreateProfile}>
                    <div>
                        <div className="mb-2 block">
                        <Label htmlFor="displayname" value="Display name" />
                        </div>
                        <TextInput id="displayname" type="text" required value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} />
                    </div>         
                    <Button type="submit">Create</Button>
                </form>
                </>
            }
            {data &&
                <div className="flex flex-col justify-center items-center">
                    <div className="format lg:format-lg">
                        <h2 >{data.display_name}</h2>
                        <div className="flex flex-row gap-4">
                            <p>1</p>
                            <p>2</p>
                            <p>3</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Profile