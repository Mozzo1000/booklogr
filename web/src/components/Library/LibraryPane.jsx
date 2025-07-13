import React, { useState, useEffect, useReducer } from 'react'
import BookItem from './BookItem'
import { Tabs, Pagination } from "flowbite-react";
import BooksService from '../../services/books.service';
import PaneTabView from './PaneTabView';
import reducer, { initialState, actionTypes } from '../../useLibraryReducer';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';

function LibraryPane() {
    const [activeTab, setActiveTab] = useState(0);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const onPageChange = (page) => setPage(page);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        getBooks(translateTabsToStatus());
        setPage(1);
        
    }, [activeTab])

    const translateTabsToStatus = () => {
        let status = "Currently reading";
        if (activeTab == 0) {
            status = "Currently reading"
        } else if (activeTab == 1) {
            status = "To be read"
         }else if (activeTab == 2) {
            status = "Read"
        }
        return status;
    }

    const getBooks = (status) => {
        BooksService.get(status, page).then(
            response => {
                dispatch({type: actionTypes.BOOKS, books: response.data})
                if (response.data.meta.totalPages > 0) {
                    setTotalPages(response.data.meta.total_pages)
                }
            }
        )
    }

    useEffect(() => {
      getBooks(translateTabsToStatus())
    }, [page])
    

    return (
        <>
        <article className="format lg:format-lg pb-2 dark:format-invert">
            <h2>{t("library")}</h2>
        </article>
        <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} variant="underline" className="pt-1">
        <Tabs.Item active title={t("reading_status.currently_reading")} icon={RiBookOpenLine}>
        <PaneTabView>
            {state.books?.items.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} allowNoteEditing={true} showNotes={false} showRating={false} showProgress={true} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title={t("reading_status.to_be_read")} icon={RiBookmarkLine}>
            <PaneTabView>
            {state.books?.items.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showNotes allowNoteEditing={true} showProgress={false} showOptions title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title={t("reading_status.read")} icon={RiBook2Line}>
            <PaneTabView>
            {state.books?.items.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showNotes allowNoteEditing={true} showProgress={false} showOptions showRating title={item.title} isbn={item.isbn} author={item.author} rating={item.rating} notes={item.num_notes} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}  />
                    </div>
                )
            })}
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