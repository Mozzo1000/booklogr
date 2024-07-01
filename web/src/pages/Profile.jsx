import React, { useEffect, useState } from 'react'
import ProfileService from '../services/profile.service';
import { Button, TextInput, Label, Badge, Card } from "flowbite-react";
import useToast from '../toast/useToast';
import BookItem from '../components/Library/BookItem';
import PaneTabView from '../components/Library/PaneTabView';
import { FaEye } from "react-icons/fa6";
import { useParams } from 'react-router-dom';

function Profile() {
    const [data, setData] = useState();
    const [noProfile, setNoProfile] = useState();
    const [createDisplayName, setCreateDisplayName] = useState();
    const toast = useToast(4000);
    let { name } = useParams();


    useEffect(() => {
        if (name) {
            ProfileService.get_by_display_name(name).then(
                response => {
                    setData(response.data)
                    setNoProfile(false);
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
        } else {
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
                            setNoProfile(true);
                        }
                    }
                }
            )
        }
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
        <div>
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
                <div>
                    <div className="format lg:format-lg">
                        <div className="flex flex-row justify-start gap-4">
                            <h2 >{data.display_name}</h2> 
                            <Badge icon={FaEye} >{data.visibility}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col text-center md:flex-row gap-4 pt-8">
                        <Card className="max-h-full">
                            <p className="font-normal text-gray-700">
                                Books read
                            </p>
                            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
                                {data.num_books_read}
                            </h5>
                        </Card>
                        <Card>
                            <p className="font-normal text-gray-700">
                                Books currently reading
                            </p>
                            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
                                {data.num_books_reading}
                            </h5>
                        </Card>
                        <Card>
                            <p className="font-normal text-gray-700">
                                Books to be read
                            </p>
                            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
                                {data.num_books_tbr}
                            </h5>
                        </Card>
                    </div>
                    <div className="inline-flex items-center justify-center w-full">
                        <hr className="w-full h-px my-8 bg-gray-200 border-0" />
                        <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2">All books</span>
                    </div>
                    <PaneTabView>
                    {data.books?.map((item) => {
                        return (
                            <div key={0}>
                                <BookItem internalID={0} showReadingStatusBadge={true} showOptions={false} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} readingStatus={item.reading_status} />
                            </div>
                        )
                    })}
                    </PaneTabView>
                </div>
            }
        </div>
    )
}

export default Profile