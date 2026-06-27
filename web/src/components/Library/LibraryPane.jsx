import React, { useState, useEffect, useReducer } from 'react'
import BookItem from './BookItem'
import { Tabs, Pagination } from "flowbite-react";
import BooksService from '../../services/books.service';
import PaneTabView from './PaneTabView';
import reducer, { initialState, actionTypes } from '../../useLibraryReducer';
import { RiArchiveLine, RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import AddBookButton from '../AddBookButton';
import BookSkeleton from '../BookSkeleton';
import Controls from './Controls';
import BookTabs from '../BookTabs';

const TAB_ALL = 0
const TAB_CURRENTLY_READING = 1;
const TAB_TO_BE_READ = 2;
const TAB_READ = 3;
const TAB_DID_NOT_FINISH = 4;

const TABS_CONFIG = [
    { id: TAB_ALL, status: "", tKey: "reading_status.all", icon: RiBook2Line },
    { id: TAB_CURRENTLY_READING, status: "Currently reading", tKey: "reading_status.currently_reading", icon: RiBookOpenLine },
    { id: TAB_TO_BE_READ, status: "To be read", tKey: "reading_status.to_be_read", icon: RiBookmarkLine },
    { id: TAB_READ, status: "Read", tKey: "reading_status.read", icon: RiBook2Line },
    { id: TAB_DID_NOT_FINISH, status: "Did not finish", tKey: "reading_status.did_not_finish", icon: RiArchiveLine },

];

const STATUS_TO_TAB = {
    "All": TAB_ALL,
    "Currently reading": TAB_CURRENTLY_READING,
    "To be read": TAB_TO_BE_READ,
    "Read": TAB_READ,
    "Did not finish": TAB_DID_NOT_FINISH,
};

const TAB_VISIBILITY_KEYS = {
    [TAB_ALL]: "all",
    [TAB_CURRENTLY_READING]: "currentlyReading",
    [TAB_TO_BE_READ]: "toBeRead",
    [TAB_READ]: "completed",
    [TAB_DID_NOT_FINISH]: "didNotFinish",
};

const DEFAULT_VISIBLE_TABS = {
    all: false,
    currentlyReading: true,
    completed: true,
    toBeRead: true,
    didNotFinish: true,
};

function getVisibleTabs() {
    const saved = localStorage.getItem("library_visible_tabs");
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_TABS;
}

function LibraryPane() {
    const { t, i18n } = useTranslation();
    const hashToTab = () => {
        const match = window.location.hash.match(/^#tab-(\d+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            if (index >= TAB_ALL && index <= TAB_DID_NOT_FINISH) return index;
        }
        const savedDefault = localStorage.getItem("library_default_view");
        return savedDefault ? (STATUS_TO_TAB[savedDefault] ?? TAB_CURRENTLY_READING) : TAB_CURRENTLY_READING;
    };
    const [activeTab, setActiveTab] = useState(hashToTab);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [view, setView] = useState(localStorage.getItem("library_view") ? localStorage.getItem("library_view") : "gallery");
    const [sort, setSort] = useState(JSON.parse(localStorage.getItem("last_sorted")) || {value: "title"});
    const [order, setOrder] = useState(localStorage.getItem("last_ordered") || "asc");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const visibleTabSettings = getVisibleTabs();
    const tabs = TABS_CONFIG
        .filter(tab => visibleTabSettings[TAB_VISIBILITY_KEYS[tab.id]])
        .map(tab => ({
            ...tab,
            title: t(tab.tKey)
        }));

    const handleTabChange = (tabIndex) => {
        const tab = tabs[tabIndex];
        if (tab) {
            setActiveTab(tab.id);
            window.location.hash = `tab-${tab.id}`;
        }
    };

    useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
    }, []);

    const onPageChange = (page) => setPage(page);


    useEffect(() => {
        dispatch({
            type: actionTypes.CLEAR
        });
        getBooks(translateTabsToStatus());
        setPage(1);
        
    }, [activeTab])

    const translateTabsToStatus = () => {
        let status = "Currently reading";
        if (activeTab == TAB_CURRENTLY_READING) {
            status = "Currently reading"
        } else if (activeTab == TAB_TO_BE_READ) {
            status = "To be read"
        } else if (activeTab == TAB_READ) {
            status = "Read"
        } else if (activeTab == TAB_DID_NOT_FINISH) {
            status = "Did not finish"
        } else if (activeTab == TAB_ALL) {
            status = ""
        }
        return status;
    }

    const getBooks = (status) => {
        BooksService.get(status === "" ? undefined : status, sort.value, order, page).then(
            response => {
                dispatch({type: actionTypes.BOOKS, books: response.data})
                if (response.data.meta.total_pages > 0) {
                    setTotalPages(response.data.meta.total_pages)
                }
            }
        )
    }

    useEffect(() => {
      getBooks(translateTabsToStatus())
    }, [page, sort, order])
    
    const changeView = (changeToView) => {
        setView(changeToView);
        localStorage.setItem("library_view", changeToView);
    }

    return (
        <>
        <div className="flex flex-row justify-between">
            <article className="format lg:format-lg pb-2 dark:format-invert">
                    <h2>{t("library")}</h2>
            </article>
            <div className="flex flex-row gap-4 pb-4">
                <AddBookButton collapseButton={isMobile} onSuccess={() => getBooks(translateTabsToStatus())}/>
                <Controls sort={sort} setSort={setSort} order={order} setOrder={setOrder} view={view} changeView={changeView}/>
            </div>
        </div>
        <BookTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
            <PaneTabView view={view} setView={setView}>
                {!state.books ? (
                    <BookSkeleton view={view} count={3} />
                ) : (
                    state.books?.items.map((item) => (
                        <div key={item.id}>
                            <BookItem 
                                internalID={item.id} 
                                view={view}
                                title={item.title}
                                subtitle={item.subtitle}
                                author={item.author} 
                                rating={item.rating} 
                                notes={item.num_notes}
                                totalPages={item.total_pages} 
                                currentPage={item.current_page}
                                isbn={item.isbn}
                                description={item.description}
                                readingStatus={item.reading_status}
                                showProgress={activeTab === TAB_ALL || activeTab === TAB_CURRENTLY_READING}
                                showRating={activeTab === TAB_ALL || activeTab === TAB_READ || activeTab === TAB_DID_NOT_FINISH}
                                showNotes={activeTab === TAB_ALL || activeTab === TAB_TO_BE_READ || activeTab === TAB_READ || activeTab === TAB_DID_NOT_FINISH}
                                allowNoteEditing
                                showOptions={activeTab !== TAB_ALL && activeTab !== TAB_CURRENTLY_READING}
                                onReadingStatusChanged={() => getBooks(translateTabsToStatus())}
                            />
                        </div>
                    ))
                )}
            </PaneTabView>
        </BookTabs>
        {state.books?.items.length > 0 &&
            <div className="flex flex-row justify-center pt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} showIcons />
            </div>
        }

        {state.books?.items.length <= 0 &&
            <div className="flex flex-col justify-center items-center text-center gap-4 pt-8">
                <RiBook2Line size={96} className="dark:text-white"/>
                <div className="format lg:format-lg dark:format-invert">
                    <h2>{t("help.no_books_found.title")}</h2>
                    <p>{t("help.no_books_found.description")}</p>
                </div>
            </div>
        }
        </>
    )
}

export default LibraryPane