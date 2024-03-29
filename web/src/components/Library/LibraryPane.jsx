import React, { useState, useEffect } from 'react'
import BookItem from './BookItem'
import { Tabs } from "flowbite-react";
import BooksService from '../../services/books.service';

function LibraryPane() {
    const [activeTab, setActiveTab] = useState(0);
    const [books, setBooks] = useState();
    
    useEffect(() => {
        let status = "Currently reading";
        if (activeTab == 0) {
            status = "Currently reading"
        } else if (activeTab == 1) {
            status = "To be read"
         }else if (activeTab == 2) {
            status = "Read"
        }
        BooksService.get(status).then(
            response => {
                setBooks(response.data)
                console.log(response.data)
            }
        )
    }, [activeTab])
    

    return (
        <>
        <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} style='fullWidth'>
        <Tabs.Item active title="Currently reading">
            <div className="grid grid-cols-3 gap-4">
            {books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem showProgress={true} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author}/>
                    </div>
                )
            })}
            </div>
        </Tabs.Item>
        <Tabs.Item title="To be read">
            <div className="grid grid-cols-3 gap-4">
            {books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author}/>
                    </div>
                )
            })}
            </div>
        </Tabs.Item>
        <Tabs.Item title="Read">
            <div className="grid grid-cols-3 gap-4">
            {books?.map((item) => {
                return (
                    <div key={item.id}>
                        <BookItem showProgress={false}  title={item.title} isbn={item.isbn} author={item.author}/>
                    </div>
                )
            })}</div>
        </Tabs.Item>
        </Tabs>
        {books?.length <= 0 &&
            <p>No books found</p>
        }
        </>
    )
}

export default LibraryPane