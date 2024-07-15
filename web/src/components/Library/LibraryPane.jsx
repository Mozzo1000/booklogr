import React, { useState, useEffect, useReducer } from 'react'
import BookItem from './BookItem'
import { Tabs } from "flowbite-react";
import BooksService from '../../services/books.service';
import PaneTabView from './PaneTabView';
import reducer, { initialState, actionTypes } from '../../useLibraryReducer';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";

function LibraryPane() {
    const [activeTab, setActiveTab] = useState(0);
    const [state, dispatch] = useReducer(reducer, initialState);

    
    useEffect(() => {
        
        getBooks(translateTabsToStatus());
        
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
        BooksService.get(status).then(
            response => {
                //setBooks(response.data)
                dispatch({type: actionTypes.BOOKS, books: response.data})
                console.log(response.data)
            }
        )
    }

    return (
        <>
        <article className="format lg:format-lg pb-2">
            <h2>My Library</h2>
        </article>
        <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} style="underline" className="pt-1">
        <Tabs.Item active title="Currently reading" icon={RiBookOpenLine}>
        <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showRating={false} showProgress={true} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title="To be read" icon={RiBookmarkLine}>
            <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} rating={item.rating} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title="Read" icon={RiBook2Line}>
            <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showProgress={false}  title={item.title} isbn={item.isbn} author={item.author} rating={item.rating} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}  />
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        </Tabs>
        {state.books?.length <= 0 &&
            <div className="flex flex-col justify-center items-center text-center gap-4 pt-8">
                <RiBook2Line size={96}/>
                <div className="format lg:format-lg">
                    <h2>No books found</h2>
                    <p>There does not seem to be any books in this list. Use the search to find a book and add it to your list.</p>
                </div>
            </div>
        }
        </>
    )
}

export default LibraryPane