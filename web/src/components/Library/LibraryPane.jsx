import React, { useState, useEffect, useReducer } from 'react'
import BookItem from './BookItem'
import { Tabs } from "flowbite-react";
import BooksService from '../../services/books.service';
import PaneTabView from './PaneTabView';
import reducer, { initialState, actionTypes } from '../../useLibraryReducer';

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
        <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} style='fullWidth'>
        <Tabs.Item active title="Currently reading">
        <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showProgress={true} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title="To be read">
            <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}/>
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        <Tabs.Item title="Read">
            <PaneTabView>
            {state.books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem internalID={item.id} showProgress={false}  title={item.title} isbn={item.isbn} author={item.author} onReadingStatusChanged={() => getBooks(translateTabsToStatus())}  />
                    </div>
                )
            })}
            </PaneTabView>
        </Tabs.Item>
        </Tabs>
        {state.books?.length <= 0 &&
            <p>No books found</p>
        }
        </>
    )
}

export default LibraryPane