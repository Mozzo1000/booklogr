import React, { useEffect, useState, useMemo } from 'react'
import ProfileService from '../services/profile.service';
import { Button, ButtonGroup, TextInput, Label, Badge, Modal, ModalHeader, ModalBody, Select, Popover, Avatar, Tooltip } from "flowbite-react";
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
import AnimatedLayout from '../AnimatedLayout';
import WelcomeModal from '../components/WelcomeModal';
import { useTranslation, Trans } from 'react-i18next';

function Profile() {
    const [data, setData] = useState();
    const [readingStatusFilter, setReadingStatusFilter] = useState("All");

    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [displayName, setDisplayName] = useState();
    const [profileVisiblity, setProfileVisiblity] = useState();
    const [profileNotFound, setProfileNotFound] = useState(false);

    const [showWelcomeModal, setShowWelcomeScreen] = useState(false);

    const toast = useToast(4000);
    let { name } = useParams();
    const currentUser = authService.getCurrentUser();
    let navigate = useNavigate();
    const { t } = useTranslation();

    const displayNamePopoverContent = (
        <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("help.title")}</h3>
            </div>
            <div className="px-3 py-2">
                <p>{t("help.display_name_change_information")}</p>
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
                setData(response.data)
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
                if (error.response.status == 404) {
                    localStorage.setItem("show_welcome_screen", true);
                    setShowWelcomeScreen(true);
                }
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
                    getProfileData();
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

    function formatVisibility(value) {
        const visibilityMap = {
            hidden: t("forms.visibility_hidden").toLowerCase(),
            public: t("forms.visibility_public").toLowerCase()
        };
        return visibilityMap[value] || value;
    }

    return (
        <AnimatedLayout>
        <div className="container mx-auto">          
            {data &&
                <div>
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar rounded />
                        <div className="format lg:format-lg dark:format-invert">
                            <h1>{data.display_name}</h1>
                        </div>
                            {currentUser &&
                                <Badge icon={RiEyeLine} >{formatVisibility(data.visibility)}</Badge>
                            }
                        </div>
                        {currentUser &&
                            <Tooltip content={t("profile.profile_settings")}>
                                <Button className="hover:cursor-pointer" color="light" pill onClick={() => setOpenSettingsModal(true)}><RiSettings4Line className="h-6 w-6"/></Button>
                            </Tooltip>
                        }                        
                    </div>
                    <div className="flex flex-row gap-16 pt-12 justify-around">
                        <BookStatsCard icon={<RiBook2Line className="w-8 h-8 dark:text-white"/>} number={data.num_books_read || 0} text={t("profile.stats.read")}/>
                        <BookStatsCard icon={<RiBookOpenLine className="w-8 h-8 dark:text-white"/>} number={data.num_books_reading || 0} text={t("profile.stats.reading")}/>
                        <BookStatsCard icon={<RiBookmarkLine className="w-8 h-8 dark:text-white"/>} number={data.num_books_tbr || 0} text={t("profile.stats.to_be_read")}/>
                    </div>
                    <div className="inline-flex items-center justify-center w-full">
                        <hr className="w-full h-px my-8 bg-gray-200 border-0" />
                        <span className="absolute font-medium text-gray-900 -translate-x-1/3 bg-white dark:bg-[#121212] dark:text-white ">{t("profile.all_books")}</span>
                    </div>
                    <ButtonGroup className="pb-4">
                        <Button color="alternative" onClick={() => setReadingStatusFilter("All")}>{t("reading_status.all")} ({data.books.length})</Button>
                        <Button color="alternative" onClick={() => setReadingStatusFilter("Read")}>{t("reading_status.read")} ({data.num_books_read || 0})</Button>
                        <Button color="alternative" onClick={() => setReadingStatusFilter("Currently reading")}>{t("reading_status.currently_reading")} ({data.num_books_reading || 0})</Button>
                        <Button color="alternative" onClick={() => setReadingStatusFilter("To be read")}>{t("reading_status.to_be_read")} ({data.num_books_tbr || 0})</Button>
                    </ButtonGroup>
                    <PaneTabView>
                    {filteredBooks.map((item, i) => {
                        console.log(item)
                        return (
                            <div key={i}>
                                <BookItem internalID={item.id} showNotes showRating disableGiveRating={true} showReadingStatusBadge={true} showOptions={false} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} readingStatus={item.reading_status} rating={item.rating} notes={item.num_notes} allowNoteEditing={false} overrideNotes={item.notes}/>
                            </div>
                        )
                    })}
                    </PaneTabView>
                    <Modal dismissible show={openSettingsModal} onClose={() => setOpenSettingsModal(false)}>
                        <ModalHeader className="border-gray-200">{t("profile.update_profile")}</ModalHeader>
                        <ModalBody>
                            <form className="flex flex-col gap-4" onSubmit={handleUpdateProfile}>
                                <div>
                                    <div className="mb-2 block">
                                        <div className="flex flex-row gap-2 items-center">
                                        <Label htmlFor="displayname">{t("forms.display_name")}</Label>
                                        <Popover trigger="hover" content={displayNamePopoverContent}>
                                            <span><RiQuestionLine className="dark:text-white"/></span>
                                        </Popover>
                                        </div>
                                    </div>
                                    <TextInput id="displayname" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="visiblity">{t("forms.visibility_label")}</Label>
                                    </div>
                                    <Select id="visiblity" required value={profileVisiblity} onChange={(e) => setProfileVisiblity(e.target.value)}>
                                        <option value="hidden">{t("forms.visibility_hidden")}</option>
                                        <option value="public">{t("forms.visibility_public")}</option>
                                    </Select>
                                </div>
                                <Button type="submit">{t("forms.update")}</Button>
                            </form>
                        </ModalBody>
                    </Modal>
                </div>
            }

            {profileNotFound &&
                <div className="flex flex-col min-h-screen justify-center items-center text-center gap-4">
                    <div className="format lg:format-lg dark:format-invert">
                        <h1>{t("profile.not_found_error.title")}</h1>
                        <p>{t("profile.not_found_error.description")}</p>
                    </div>
                    <Link to="/">
                        <Button color="dark" size="lg">{t("navigation.go_home")}</Button>
                    </Link>
                </div>
            }
        </div>
        <WelcomeModal show={showWelcomeModal} onProfileCreate={() => getProfileData()}/>
        </AnimatedLayout>
    )
}

export default Profile