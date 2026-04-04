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

const TAB_CURRENTLY_READING = 0;
const TAB_TO_BE_READ = 1;
const TAB_READ = 2;
const TAB_DID_NOT_FINISH = 3;

function LibraryPane() {
    const { t, i18n } = useTranslation();
    const hashToTab = () => {
        const match = window.location.hash.match(/^#tab-(\d+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            if (index >= TAB_CURRENTLY_READING && index <= TAB_DID_NOT_FINISH) return index;
        }
        return TAB_CURRENTLY_READING;
    };
    const [activeTab, setActiveTab] = useState(hashToTab);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [view, setView] = useState(localStorage.getItem("library_view") ? localStorage.getItem("library_view") : "gallery");
    const [sort, setSort] = useState(JSON.parse(localStorage.getItem("last_sorted")) || JSON.parse(JSON.stringify({value: "title", name: t("sort.title")})));
    const [order, setOrder] = useState(localStorage.getItem("last_ordered") || "asc");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.location.hash = `tab-${tab}`;
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
        }
        return status;
    }

    const getBooks = (status) => {
        BooksService.get(status, sort.value, order, page).then(
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
        <Tabs onActiveTabChange={handleTabChange} variant={isMobile ? "fullWidth" : "underline"} className="pt-1">
        <Tabs.Item active={activeTab === TAB_CURRENTLY_READING} title={isMobile ? "" : t("reading_status.currently_reading")} icon={RiBookOpenLine}>
            <PaneTabView view={view} setView={setView}>
                {!state.books ? (
                    <BookSkeleton view={view} count={3} />
                ): (
                    state.books?.items.map((item) => {
                        return (
                            <div key={item.id}>
                                <BookItem internalID={item.id} view={view} allowNoteEditing={true} showNotes={false} showRating={false} showProgress={true} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                            </div>
                        )
                    })
                )}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item active={activeTab === TAB_TO_BE_READ} title={isMobile ? "" : t("reading_status.to_be_read")} icon={RiBookmarkLine}>
            <PaneTabView view={view} setView={setView}>
                {!state.books ? (
                    <BookSkeleton view={view} count={3} />
                ): (
                    state.books?.items.map((item) => {
                        return (
                            <div key={item.id}>
                                <BookItem internalID={item.id} view={view} showNotes allowNoteEditing={true} showProgress={false} showOptions title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                            </div>
                        )
                    })
                )}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item active={activeTab === TAB_READ} title={isMobile ? "" : t("reading_status.read")} icon={RiBook2Line}>
            <PaneTabView view={view} setView={setView}>
                {!state.books ? (
                    <BookSkeleton view={view} count={3} />
                ): (
                state.books?.items.map((item) => {
                    return (
                        <div key={item.id}>
                            <BookItem internalID={item.id} view={view} showNotes allowNoteEditing={true} showProgress={false} showOptions showRating title={item.title} isbn={item.isbn} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}  />
                        </div>
                    )
                })
            )}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item active={activeTab === TAB_DID_NOT_FINISH} title={isMobile ? "" : t("reading_status.did_not_finish")} icon={RiArchiveLine}>
            <PaneTabView view={view} setView={setView}>
                {!state.books ? (
                    <BookSkeleton view={view} count={3} />
                ): (
                    state.books?.items.map((item) => {
                        return (
                            <div key={item.id}>
                                <BookItem internalID={item.id} view={view} showNotes allowNoteEditing={true} showProgress={false} showOptions showRating title={item.title} isbn={item.isbn} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}  />
                            </div>
                        )
                    })
                )}
            </PaneTabView>
        </Tabs.Item>
        </Tabs>
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