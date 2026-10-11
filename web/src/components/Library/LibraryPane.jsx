import React, { useState, useEffect } from 'react'
import BookItem from './BookItem'
import { Pagination } from "flowbite-react";
import { useQueryClient } from '@tanstack/react-query';
import { useBooks } from '../../hooks/useBooks';
import PaneTabView from './PaneTabView';
import { RiArchiveLine, RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { RiCloseLine, RiFilterLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import AddBookButton from '../AddBookButton';
import BookSkeleton from '../BookSkeleton';
import Controls from './Controls';
import BookTabs from '../BookTabs';
import { LIBRARY_TABS, getLibraryNavigation, resolveLibraryTab } from '../../services/libraryNavigation';

const TAB_ALL = 0
const TAB_CURRENTLY_READING = 1;
const TAB_TO_BE_READ = 2;
const TAB_READ = 3;
const TAB_DID_NOT_FINISH = 4;

const TAB_ICONS = [RiBook2Line, RiBookOpenLine, RiBookmarkLine, RiBook2Line, RiArchiveLine];

function LibraryPane() {
    const { t } = useTranslation();
    const [navigation] = useState(getLibraryNavigation);
    const [activeTab, setActiveTab] = useState(() => resolveLibraryTab(
        window.location.hash, navigation.defaultView, navigation.visibleTabs,
    ));
    const [page, setPage] = useState(1);
    const [view, setView] = useState(localStorage.getItem("library_view") ? localStorage.getItem("library_view") : "gallery");
    const [sort, setSort] = useState(JSON.parse(localStorage.getItem("last_sorted")) || {value: "title"});
    const [order, setOrder] = useState(localStorage.getItem("last_ordered") || "asc");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [authorFilter, setAuthorFilter] = useState(null);

    const tabs = LIBRARY_TABS
        .filter(tab => navigation.visibleTabs[tab.key])
        .map(tab => ({
            ...tab,
            icon: TAB_ICONS[tab.id],
            title: t(tab.tKey)
        }));

    useEffect(() => {
        if (window.location.hash.match(/^#tab-\d+$/) && window.location.hash !== `#tab-${activeTab}`) {
            window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#tab-${activeTab}`);
        }
    }, [activeTab]);

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
        setPage(1);
    }, [activeTab, authorFilter])

    const queryClient = useQueryClient();
    const { data: booksResponse } = useBooks({ status: LIBRARY_TABS.find(tab => tab.id === activeTab).status, sort: sort.value, order, page, author: authorFilter });
    const books = booksResponse?.data;
    const totalPages = books?.meta.total_pages > 0 ? books.meta.total_pages : 1;
    const refetchBooks = () => queryClient.invalidateQueries({ queryKey: ['books'] });

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
                <AddBookButton collapseButton={isMobile} onSuccess={refetchBooks}/>
                <Controls sort={sort} setSort={setSort} order={order} setOrder={setOrder} view={view} changeView={changeView}/>
            </div>
        </div>
        <BookTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
            {authorFilter &&
                <div className="flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 w-full sm:w-fit">
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <RiFilterLine className="h-4 w-4 shrink-0" />
                        {t("book.filter_by_author", {author: authorFilter})}
                    </span>
                    <button
                        type="button"
                        onClick={() => setAuthorFilter(null)}
                        aria-label={t("book.clear_author_filter")}
                        className="p-1.5 -mr-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800"
                    >
                        <RiCloseLine className="h-5 w-5" />
                    </button>
                </div>
            }
            <PaneTabView view={view} setView={setView}>
                {!books ? (
                    <BookSkeleton view={view} count={3} />
                ) : (
                    books?.items.map((item) => (
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
                                onAuthorClick={setAuthorFilter}
                                showProgress={activeTab === TAB_ALL || activeTab === TAB_CURRENTLY_READING}
                                showRating={activeTab === TAB_ALL || activeTab === TAB_READ || activeTab === TAB_DID_NOT_FINISH}
                                showNotes={activeTab === TAB_ALL || activeTab === TAB_TO_BE_READ || activeTab === TAB_READ || activeTab === TAB_DID_NOT_FINISH}
                                allowNoteEditing
                                showOptions={activeTab !== TAB_ALL && activeTab !== TAB_CURRENTLY_READING}
                                onReadingStatusChanged={refetchBooks}
                            />
                        </div>
                    ))
                )}
            </PaneTabView>
        </BookTabs>
        {books?.items.length > 0 &&
            <div className="flex flex-row justify-center pt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} showIcons />
            </div>
        }

        {books?.items.length <= 0 &&
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