import React, { useEffect, useState, useMemo } from 'react'
import ProfileService from '../services/profile.service';
import { Button, TextInput, Label, Badge, Modal, Select, Popover, Avatar } from "flowbite-react";
import useToast from '../toast/useToast';
import BookItem from '../components/Library/BookItem';
import PaneTabView from '../components/Library/PaneTabView';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookStatsCard from '../components/BookStatsCard';
import { RiSettings4Line } from "react-icons/ri";
import { RiQuestionLine } from "react-icons/ri";
import authService from '../services/auth.service';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { RiEyeLine } from "react-icons/ri";

function Profile() {
    const [data, setData] = useState();
    const [noProfile, setNoProfile] = useState();
    const [createDisplayName, setCreateDisplayName] = useState();
    const [readingStatusFilter, setReadingStatusFilter] = useState("All");

    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [displayName, setDisplayName] = useState();
    const [profileVisiblity, setProfileVisiblity] = useState();
    const [profileNotFound, setProfileNotFound] = useState(false);

    const toast = useToast(4000);
    let { name } = useParams();
    const currentUser = authService.getCurrentUser();
    let navigate = useNavigate();

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
                    setProfileNotFound(true);
                }
            )
        } else {
            getProfileData();
        }
    }, [])

    const getProfileData = () => {
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

    const handleCreateProfile = (e) => {
        e.preventDefault();
        ProfileService.create({"display_name": createDisplayName}).then(
            response => {
                toast("success", response.data.message);
                getProfileData();
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
        <div className="container mx-auto">
            
            <Modal show={noProfile}>
                <Modal.Body>
                    <form className="flex flex-col gap-4" onSubmit={handleCreateProfile}>
                        <div className="format lg:format-lg">
                            <h3>Create profile</h3>
                            <p>A profile is used to publicly display your library and what you are currently reading.</p>
                            <p>Your display name will be used to link to your profile page. Display name and visibility of your profile page can be changed at any time.</p>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="displayname" value="Display name" />
                            </div>
                            <TextInput id="displayname" type="text" required value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} />
                        </div>         
                        <Button type="submit" disabled={!createDisplayName}>Create</Button>
                        <Button color="light" onClick={() => navigate("/library")}>Cancel</Button>
                    </form>
                </Modal.Body>
            </Modal>
            
            {data &&
                <div>
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar rounded />
                        <div className="format lg:format-lg">
                            <h1 >{data.display_name}</h1>
                        </div>
                            {currentUser &&
                                <Badge icon={RiEyeLine} >{data.visibility}</Badge>
                            }
                        </div>
                        {currentUser &&
                            <Button outline color="light" pill onClick={() => setOpenSettingsModal(true)}><RiSettings4Line className="h-6 w-6"/></Button>
                        }                        
                    </div>
                    <div className="flex flex-row gap-16 pt-12 justify-around">
                        <BookStatsCard icon={<RiBook2Line className="w-8 h-8"/>} number={data.num_books_read || 0} text="Read"/>
                        <BookStatsCard icon={<RiBookOpenLine className="w-8 h-8"/>} number={data.num_books_reading || 0} text="Reading"/>
                        <BookStatsCard icon={<RiBookmarkLine className="w-8 h-8"/>} number={data.num_books_tbr || 0} text="To Be Read"/>
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
                                        <span><RiQuestionLine /></span>
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

            {profileNotFound &&
                <div className="flex flex-col min-h-screen justify-center items-center text-center gap-4">
                    <div className="format lg:format-lg">
                        <h1>No profile found</h1>
                        <p>We could not find a profile with that name. Either the profile does not exist or it is set to hidden.</p>
                    </div>
                    <Link to="/">
                        <Button color="dark" size="lg">Go home</Button>
                    </Link>
                </div>
            }

        </div>
    )
}

export default Profile