import React, { useEffect, useState } from 'react'
import { useParams, Link } from "react-router-dom";
import OpenLibraryService from '../services/openlibrary.service';
import { JSONTree } from 'react-json-tree';
import OpenLibraryButton from '../components/OpenLibraryButton';
import BooksService from '../services/books.service';
import AddToReadingListButtton from '../components/AddToReadingListButton';

function BookDetails() {
    let { id } = useParams();
    const [data, setData] = useState();

    useEffect(() => {
        OpenLibraryService.get(id).then(
            response => {
                setData(response.data["ISBN:" + id]);
                console.log(response.data)
            }
        )
    }, [])

    return (
        <>
            <div>BookDetails: {id}</div>
            <OpenLibraryButton isbn={id} />
            <AddToReadingListButtton isbn={id} data={data} />
            {data &&
                <JSONTree data={data} />
            }
        </>
    )
}

export default BookDetails