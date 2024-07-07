import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import OpenLibraryService from '../services/openlibrary.service';
import OpenLibraryButton from '../components/OpenLibraryButton';
import AddToReadingListButtton from '../components/AddToReadingListButton';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import useToast from '../toast/useToast';

function BookDetails() {
    let { id } = useParams();
    const [data, setData] = useState();
    const [description, setDescription] = useState();
    const toast = useToast(4000);

    useEffect(() => {
        OpenLibraryService.get(id).then(
            response => {
                setData(response.data["docs"][0]);
                console.log(response.data)

                OpenLibraryService.getWorks(response.data["docs"][0].key).then(
                    response => {
                        console.log(response.data)
                        if (response.data.description) {
                            if (response.data.description.value) {
                                setDescription(response.data.description.value)
                            } else {
                                setDescription(response.data.description)
                            }
                        } else {
                            setDescription("No description found")
                        }
                    }
                )
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", "OpenLibrary: " + resMessage);
            }
        )
    }, [])

    return (
        <div className="pt-10 lg:pt-20 pb-10">
            <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 gap-4 justify-items-stretch	">
                <div className="lg:row-span-2 mx-auto">
                    <img className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/isbn/" + id + "-L.jpg"} alt=""></img>
                </div>
                <div>
                    <article className="format">
                        <h2>{data?.title || <Skeleton />}</h2>
                        <p className="lead">by {data?.author_name?.[0] || <Skeleton className="w-1/2" />}</p>
                        <p>{description || <Skeleton count={4.5}/>}</p>
                        <p><span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">Pages</span> {data?.number_of_pages_median || <Skeleton width={50} />}</p>
                        <p><span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">ISBN</span> {id}</p>
                    </article>
                </div>
                <div className="lg:col-start-2 lg:row-start-2">
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