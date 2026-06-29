import React, { useEffect, useState, useMemo } from 'react'
import ProfileService from '../services/profile.service';
import { Button, ButtonGroup, TextInput, Label, Badge, Modal, ModalHeader, ModalBody, Select, Popover, Avatar, Tooltip, useThemeMode } from "flowbite-react";
import useToast from '../toast/useToast';
import BookItem from '../components/Library/BookItem';
import PaneTabView from '../components/Library/PaneTabView';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookStatsCard from '../components/BookStatsCard';
import { RiArchiveLine, RiSettings4Line } from "react-icons/ri";
import { RiQuestionLine } from "react-icons/ri";
import authService from '../services/auth.service';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { RiEyeLine } from "react-icons/ri";
import { RiBook2Fill } from "react-icons/ri";
import { RiStickyNoteLine, RiDoubleQuotesR } from "react-icons/ri";
import AnimatedLayout from '../AnimatedLayout';
import WelcomeModal from '../components/WelcomeModal';
import { useTranslation, Trans } from 'react-i18next';
import { RiListView } from "react-icons/ri";
import { RiGalleryView } from "react-icons/ri";
import BookSkeleton from '../components/BookSkeleton';
import ShareProfileButton from '../components/ShareProfileButton';
import Controls from '../components/Library/Controls';
import BookTabs from '../components/BookTabs';
import AuthService from '../services/auth.service';
import { useProfilePicture } from '../useProfilePicture';
import NotesFeedItem from '../components/NotesFeedItem';

const PROFILE_TABS = [
    { id: 0, status: "All", tKey: "reading_status.all", icon: RiBook2Line }, // Icon of your choice
    { id: 1, status: "Currently reading", tKey: "reading_status.currently_reading", icon: RiBookOpenLine },
    { id: 2, status: "To be read", tKey: "reading_status.to_be_read", icon: RiBookmarkLine },
    { id: 3, status: "Read", tKey: "reading_status.read", icon: RiBook2Line },
    { id: 4, status: "Did not finish", tKey: "reading_status.did_not_finish", icon: RiArchiveLine },
];

function Profile() {
    const [data, setData] = useState();
    const [activeTab, setActiveTab] = useState(0);
    
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [displayName, setDisplayName] = useState();
    const [profileVisiblity, setProfileVisiblity] = useState();
    const [profileNotFound, setProfileNotFound] = useState(false);
    const [view, setView] = useState(localStorage.getItem("library_view") ? localStorage.getItem("library_view") : "gallery");
    const [section, setSection] = useState("books"); // "books" | "notes"

    const [showWelcomeModal, setShowWelcomeScreen] = useState(false);

    const [profilePicture, setProfilePicture] = useState(null);
    const { imgSrc, loading } = useProfilePicture(profilePicture);

    const toast = useToast(4000);
    let { name } = useParams();
    const currentUser = authService.getCurrentUser();
    let navigate = useNavigate();
    const { t } = useTranslation();
    const { mode } = useThemeMode();

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
        const currentStatus = PROFILE_TABS[activeTab].status;
        if (currentStatus === "All") {
            return data.books;
        } else {
            return data.books.filter(book => 
                book.reading_status.toLowerCase() === currentStatus.toLowerCase()
            );
        }
    }
    }, [data, activeTab]);

    const allNotes = useMemo(() => {
        if (!data) return null;
        const notes = data.books.flatMap(book =>
            (book.notes || [])
                .filter(note => note && note.visibility === 'public')
                .map(note => ({
                    ...note,
                    bookTitle: book.title,
                    bookIsbn: book.isbn,
                    bookAuthor: book.author,
                }))
        );
        return notes.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
    }, [data, name]);
    
    const tabs = PROFILE_TABS.map(tab => ({
        ...tab,
        title: t(tab.tKey)
    }));

    useEffect(() => {
        if (name) {
            ProfileService.get_by_display_name(name).then(
                response => {
                    setData(response.data)
                    setDisplayName(response.data.display_name);
                    setProfileVisiblity(response.data.visibility)
                    setProfilePicture(response.data.profile_picture)
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
                setProfilePicture(response.data.profile_picture);
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

    function formatStatus(value) {
        const statusMap = {
            "Read": t("reading_status.read"),
            "Currently reading": t("reading_status.currently_reading"),
            "To be read": t("reading_status.to_be_read"),
            "Did not finish": t("reading_status.did_not_finish")

        };
        return statusMap[value] || value;
    }

    const changeView = (changeToView) => {
        setView(changeToView);
        localStorage.setItem("library_view", changeToView);
    }

    return (
        <AnimatedLayout>
        <div className="container mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar rounded img={imgSrc}/>
                    <div className="format lg:format-lg dark:format-invert">
                        <h1 className="mb-0">{data?.display_name}</h1>
                    </div>
                    
                    {currentUser && (
                        <div className="hidden md:block">
                            <Badge icon={RiEyeLine}>{formatVisibility(data?.visibility)}</Badge>
                        </div>
                    )}
                </div>

                <div className="flex flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    {currentUser && (
                        <div className="block md:hidden">
                            <Badge icon={RiEyeLine}>{formatVisibility(data?.visibility)}</Badge>
                        </div>
                    )}

                    <div className="flex flex-row gap-4 ml-auto md:ml-0">
                        {profileVisiblity === "public" && (
                            <ShareProfileButton displayName={data?.display_name} />
                        )}
                        {currentUser && (
                            <Tooltip content={t("profile.profile_settings")}>
                                <Button className="hover:cursor-pointer" color="light" pill onClick={() => setOpenSettingsModal(true)}>
                                    <RiSettings4Line className="h-6 w-6" />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12">
                    <BookStatsCard icon={<RiBook2Line className="w-8 h-8 dark:text-white"/>} number={data?.num_books_read || 0} text={t("profile.stats.read")}/>
                    <BookStatsCard icon={<RiBookOpenLine className="w-8 h-8 dark:text-white"/>} number={data?.num_books_reading || 0} text={t("profile.stats.reading")}/>
                    <BookStatsCard icon={<RiBookmarkLine className="w-8 h-8 dark:text-white"/>} number={data?.num_books_tbr || 0} text={t("profile.stats.to_be_read")}/>
                    <BookStatsCard icon={<RiArchiveLine className="w-8 h-8 dark:text-white"/>} number={data?.num_books_dnf || 0} text={t("profile.stats.did_not_finish")}/>

                </div>
                <div className="flex pt-8 pb-4">
                    <ButtonGroup className="w-full">
                        <Button className="w-full" color={mode === "dark" ? "dark" : section === "books" ? "dark" : "light"} outline={mode === "dark" && section !== "books"} onClick={() => setSection("books")}>
                            <RiBook2Fill className="mr-2 h-4 w-4" />
                            {t("profile.all_books")}
                        </Button>
                        <Button className="w-full" color={mode === "dark" ? "dark" : section === "notes" ? "dark" : "light"} outline={mode === "dark" && section !== "notes"} onClick={() => setSection("notes")}>
                            <RiStickyNoteLine className="mr-2 h-4 w-4" />
                            {t("notes.title")}
                        </Button>
                    </ButtonGroup>
                </div>

                {section === "books" && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between md:items-start">
                            <div className="w-full order-2 md:order-1">
                                <BookTabs
                                    tabs={tabs}
                                    activeTab={activeTab}
                                    onTabChange={(tabIndex) => setActiveTab(tabIndex)}
                                />
                            </div>

                            <div className="flex justify-end order-1 md:order-2 shrink-0">
                                <Controls view={view} changeView={changeView} enableSort={false} />
                            </div>
                        </div>

                        <div className="w-full">
                            <PaneTabView view={view}>
                                {!filteredBooks ? (
                                    <BookSkeleton count={4}/>
                                ) : (
                                    filteredBooks?.map((item, i) => (
                                        <div key={i}>
                                            <BookItem 
                                                {...item} 
                                                internalID={item.id} 
                                                view={view} 
                                                showReadingStatusBadge={true} 
                                                allowNoteEditing={false}
                                                showNotes 
                                                showRating 
                                                disableGiveRating={true}
                                                showOptions={false} 
                                                showProgress={false} 
                                                title={item.title} 
                                                isbn={item.isbn} 
                                                totalPages={item.total_pages} 
                                                currentPage={item.current_page} 
                                                author={item.author} 
                                                readingStatus={formatStatus(item.reading_status)} 
                                                rating={item.rating} 
                                                notes={item.num_notes} 
                                                overrideNotes={item.notes}
                                            />
                                        </div>
                                    ))
                                )}
                            </PaneTabView>
                        </div>
                    </>
                )}

                {section === "notes" && (
                    <div className="w-full">
                        {!allNotes ? (
                            <BookSkeleton count={4} />
                        ) : allNotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
                                <RiDoubleQuotesR size={64} className="text-gray-300 dark:text-gray-600" />
                                <div className="format dark:format-invert">
                                    <h3>{t("profile.notes_feed.empty_title")}</h3>
                                    <p>{t("profile.notes_feed.empty_description")}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-4">
                                {allNotes.map((note) => (
                                    <NotesFeedItem
                                        key={note.id}
                                        id={note.id}
                                        content={note.content}
                                        quotePage={note.quote_page}
                                        date={note.created_on + "Z"}
                                        bookTitle={note.bookTitle}
                                        bookIsbn={note.bookIsbn}
                                        bookAuthor={note.bookAuthor}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
        {!name &&
            <WelcomeModal show={showWelcomeModal} onProfileCreate={() => getProfileData()}/>
        }
        </AnimatedLayout>
    )
}

export default Profile