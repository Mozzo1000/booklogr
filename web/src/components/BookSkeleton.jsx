import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Progress } from "flowbite-react";

const BookSkeleton = ({ view, count = 3, showProgress = true }) => {
    return (
        <>
        {Array(count).fill(0).map((_, i) => (
        <div className={`${view === "gallery" ? "flex-col min-h-full" : "min-w-full flex-row"} flex bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                    <div className={`${view === "gallery" ? "w-full h-186" : "w-60 h-52"} object-cover  rounded-t-lg md:h-auto md:w-24 md:rounded-s-lg`}>
                        <Skeleton count={1} width={96} height={"100%"} borderRadius={0} inline={true}/>
                    </div>
                    <div className="flex flex-col p-4 leading-normal w-full">
                    <Skeleton count={1} />
                    <Skeleton count={1} />
                    {showProgress &&
                        <>
                        <Skeleton count={1} />
                        <div className='flex flex-row items-center'>
                            <Skeleton count={2} />
                        </div>
                        <Skeleton count={1} />
                        </>
                    }
                </div>
            </div>
        ))}
        </>
    );
};

export default BookSkeleton;