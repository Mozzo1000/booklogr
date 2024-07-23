import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import OpenLibraryService from '../services/openlibrary.service';
import OpenLibraryButton from '../components/OpenLibraryButton';
import AddToReadingListButtton from '../components/AddToReadingListButton';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import useToast from '../toast/useToast';
import { Helmet } from 'react-helmet-async';
import { Img } from 'react-image'

function BookDetails() {
    let { id } = useParams();
    const [data, setData] = useState();
    const [description, setDescription] = useState();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const toast = useToast(4000);

    useEffect(() => {
        OpenLibraryService.get(id).then(
            response => {
                setData(response.data["docs"][0]);
                console.log(response.data)
                setLoading(false);

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
        <>
        <Helmet>
            <meta property="og:title" content={data?.title} />
            <meta property="og:description" content={"by " + data?.author_name} />
            <meta property="og:image" content={"https://covers.openlibrary.org/b/isbn/" + id + "-L.jpg?default=false"} />
            <meta property="og:url" content={window.location.href} />
        </Helmet>
        <div className="pt-10 lg:pt-20 pb-10">
            <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 gap-4 justify-items-stretch	">
                <div className="lg:row-span-2 mx-auto">
                    <Img className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/isbn/" + id + "-L.jpg?default=false"} 
                        loader={<Skeleton count={1} width={320} height={500} borderRadius={0} inline={true}/>}
                        unloader={<img src="/fallback-cover.svg"/>}
                    />
                    </div>
                <div>
                    <article className="format">
                        <h2>{data?.title || <Skeleton />}</h2>
                        <p className="lead">by {data?.author_name?.[0] || <Skeleton className="w-1/2" />}</p>
                        <p>{description || <Skeleton count={4.5}/>}</p>
                        <p>
                            <span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">Pages</span> 
                            {loading ? (
                                <Skeleton width={50} />
                            ): (
                                data?.number_of_pages_median || 0
                            )}
                        </p>
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
        </>
    )
}

export default BookDetails