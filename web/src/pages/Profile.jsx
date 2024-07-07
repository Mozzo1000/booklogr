import React, { useEffect, useState, useMemo } from 'react'
import ProfileService from '../services/profile.service';
import { Button, TextInput, Label, Badge, Modal, Select, Popover } from "flowbite-react";
import useToast from '../toast/useToast';
import BookItem from '../components/Library/BookItem';
import PaneTabView from '../components/Library/PaneTabView';
import { FaEye } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import BookStatsCard from '../components/BookStatsCard';
import { FaBook } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa6";
import { FaBookOpen } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaCircleQuestion } from "react-icons/fa6";
import authService from '../services/auth.service';

function Profile() {
    const [data, setData] = useState();
    const [noProfile, setNoProfile] = useState();
    const [createDisplayName, setCreateDisplayName] = useState();
    const [readingStatusFilter, setReadingStatusFilter] = useState("All");

    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [displayName, setDisplayName] = useState();
    const [profileVisiblity, setProfileVisiblity] = useState();

    const toast = useToast(4000);
    let { name } = useParams();
    const currentUser = authService.getCurrentUser();

    const displayNamePopoverContent = (
        <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Help</h3>
            </div>
            <div className="px-3 py-2">
                <p>Changing your display name will also change the link to get to your public profile.</p>
            </div>
        </div>
    )

    const filteredBooks = useMemo(() => {
        if (data) {
            if (readingStatusFilter == "All") {
                return data.books;
            } else {
                return data.books.filter(data => data.reading_status.toLowerCase() === readingStatusFilter.toLowerCase());
            }
        }
      }, [data, readingStatusFilter]);
    

    useEffect(() => {
        if (name) {
            ProfileService.get_by_display_name(name).then(
                response => {
                    setData(response.data)
                    setNoProfile(false);
                    setDisplayName(response.data.display_name);
                    setProfileVisiblity(response.data.visibility)
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
                    setDisplayName(response.data.display_name);
                    setProfileVisiblity(response.data.visibility)
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

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        let newProfileData = {}

        if(displayName != data.display_name) {
            newProfileData.display_name = displayName;
        }

        if(profileVisiblity != data.visibility) {
            newProfileData.visibility = profileVisiblity;
        }
        if (Object.keys(newProfileData).length > 0) {
            ProfileService.edit(newProfileData).then(
                response => {
                    toast("success", response.data.message);
                    setOpenSettingsModal(false);
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    setOpenSettingsModal(false);
                    toast("error", resMessage);
                }
            )
        }
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
                    <div className="flex flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                        <div className="format lg:format-lg">
                            <h2 >{data.display_name}</h2>
                        </div>
                            {currentUser &&
                                <Badge icon={FaEye} >{data.visibility}</Badge>
                            }
                        </div>
                        {currentUser &&
                            <Button pill outline onClick={() => setOpenSettingsModal(true)}><FaGear className="h-6 w-6"/></Button>
                        }
                    </div>
                    <div className="flex flex-row gap-16 pt-8 justify-around">
                        <BookStatsCard icon={<FaBook className="w-8 h-8"/>} number={data.num_books_read || 0} text="Read"/>
                        <BookStatsCard icon={<FaBookOpen className="w-8 h-8"/>} number={data.num_books_reading || 0} text="Reading"/>
                        <BookStatsCard icon={<FaBookmark className="w-8 h-8"/>} number={data.num_books_tbr || 0} text="To Be Read"/>
                    </div>
                    <div className="inline-flex items-center justify-center w-full">
                        <hr className="w-full h-px my-8 bg-gray-200 border-0" />
                        <span className="absolute font-medium text-gray-900 -translate-x-1/3 bg-white ">All books</span>
                    </div>
                    <Button.Group className="pb-4">
                        <Button color="gray" onClick={() => setReadingStatusFilter("All")}>All ({data.books.length})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("Read")}>Read ({data.num_books_read || 0})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("Currently reading")}>Currently reading ({data.num_books_reading || 0})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("To be read")}>To be read ({data.num_books_tbr || 0})</Button>
                    </Button.Group>
                    <PaneTabView>
                    {filteredBooks.map((item) => {
                        return (
                            <div key={0}>
                                <BookItem internalID={0} showReadingStatusBadge={true} showOptions={false} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} readingStatus={item.reading_status} />
                            </div>
                        )
                    })}
                    </PaneTabView>
                    <Modal dismissible show={openSettingsModal} onClose={() => setOpenSettingsModal(false)}>
                        <Modal.Header>Update profile</Modal.Header>
                        <Modal.Body>
                            <form className="flex flex-col gap-4" onSubmit={handleUpdateProfile}>
                                <div className="mb-2 block">
                                    <div className="flex flex-row gap-2 items-center">
                                    <Label htmlFor="displayname" value="Display name" />
                                    <Popover trigger="hover" content={displayNamePopoverContent}>
                                        <span><FaCircleQuestion /></span>
                                    </Popover>
                                    </div>
                                </div>
                                <TextInput id="displayname" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                <div className="mb-2 block">
                                    <Label htmlFor="visiblity" value="Visiblity" />
                                </div>
                                <Select id="visiblity" required value={profileVisiblity} onChange={(e) => setProfileVisiblity(e.target.value)}>
                                    <option value="hidden">Hidden</option>
                                    <option value="public">Public</option>
                                </Select>
                                <Button type="submit">Update</Button>
                            </form>
                        </Modal.Body>
                    </Modal>
                </div>
                
            }
        </div>
    )
}

export default Profile