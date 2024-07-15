import React from 'react'
import { Progress, Badge } from "flowbite-react";
import { Link } from 'react-router-dom';
import UpdateReadingStatusButton from '../UpdateReadingStatusButton';
import ActionsBookLibraryButton from '../ActionsBookLibraryButton';

function BookItem(props) {
    return (
        <div className="min-h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-24 md:rounded-none md:rounded-s-lg" src={"https://covers.openlibrary.org/b/isbn/" + props.isbn + "-L.jpg"} alt=""></img>
            <div className="flex flex-col p-4 leading-normal w-full">
                <Link to={"/books/" + props.isbn} className="hover:underline">
                    <h5 className="mb-2 text font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h5>
                </Link>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">by {props.author}</p>

                {props.showReadingStatusBadge &&
                    <Badge color="gray" className="w-fit">{props.readingStatus}</Badge>
                }

                {props.showProgress &&
                    <>
                    <Progress className="mb-3" progress={Math.round((100 * props.currentPage) / props.totalPages)} size="md" labelProgress textLabel="Reading progress" labelText textLabelPosition="outside" progressLabelPosition="outside" />
                    <div className='flex flex-row items-center'>
                        <div className="grow">
                            <UpdateReadingStatusButton totalPages={props.totalPages} id={props.internalID} title={props.title} onSucess={props.onReadingStatusChanged}/>
                        </div>
                        <ActionsBookLibraryButton id={props.internalID} onSuccess={props.onReadingStatusChanged}/>
                    </div>
                    </>
                }
                {!props.showProgress && props.showOptions &&
                    <div className="flex flex-row-reverse">
                        <ActionsBookLibraryButton id={props.internalID} onSuccess={props.onReadingStatusChanged}/>
                    </div>
                }
            </div>
        </div>
    )
}

BookItem.defaultProps = {
    showProgress: true,
    showOptions: true,
    showReadingStatusBadge: false,
  }

export default BookItem