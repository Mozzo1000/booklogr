import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import OpenLibraryService from '../services/openlibrary.service';
import OpenLibraryButton from '../components/OpenLibraryButton';
import AddToReadingListButtton from '../components/AddToReadingListButton';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
        <div className="pt-10 lg:pt-20 pb-20">
            <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 justify-items-center lg:justify-items-stretch	">
                <div className="lg:row-span-2 mx-auto">
                    <img className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/isbn/" + id + "-L.jpg"} alt=""></img>
                </div>
                <div>
                    <article className="format">
                        <h2>{data?.title || <Skeleton />}</h2>
                        <p className="lead">by {data?.authors?.[0].name || <Skeleton className="w-1/2" />}</p>
                        <p><Skeleton count={4.5}/></p>
                        <p><span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">Pages</span> {data?.number_of_pages || <Skeleton width={50} />}</p>
                    </article>
                </div>
                <div className="lg:col-start-2 lg:row-start-2 content-center">
                    <div className="flex flex-row gap-4 ">
                        <AddToReadingListButtton isbn={id} data={data} />
                        <OpenLibraryButton isbn={id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookDetails