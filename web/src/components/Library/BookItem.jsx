import React, { useState } from 'react'
import { Progress, Badge } from "flowbite-react";
import { Link } from 'react-router-dom';
import UpdateReadingStatusButton from '../UpdateReadingStatusButton';
import ActionsBookLibraryButton from '../ActionsBookLibraryButton';
import BookRating from './BookRating';
import Skeleton from 'react-loading-skeleton'
import NotesIcon from '../NotesIcon';
import { Img } from 'react-image'
import { useThemeMode } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function BookItem(props) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const theme = useThemeMode();
    const { t } = useTranslation();
    
    return (
        <div className={`${props.view === "gallery" ? "flex-col min-h-full" : "min-w-full flex-row"} flex bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                <Img className={`${props.view === "gallery" ? "w-full h-80" : "w-60 h-52"} object-cover  rounded-t-lg md:h-auto md:w-24 md:rounded-s-lg`} src={"https://covers.openlibrary.org/b/isbn/" + props.isbn + "-L.jpg?default=false"} 
                    loader={<Skeleton count={1} width={96} height={"100%"} borderRadius={0} inline={true}/>}
                    unloader={theme.mode == "dark" && <img className="object-fit h-56 w-full rounded-t-lg md:h-auto md:w-24 md:rounded-s-lg" src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img className="object-fit h-56 w-full rounded-t-lg md:h-auto md:w-24 md:rounded-s-lg" src="/fallback-cover.svg"/>}

                />
                <div className="flex flex-col p-4 leading-normal w-full">
                <Link to={"/books/" + props.isbn} className="hover:underline">
                    <h5 className="mb-2 text font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h5>
                </Link>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{t("book.by_author", {author: props.author})}</p>

                {props.showReadingStatusBadge &&
                    <Badge color="gray" className="w-fit">{props.readingStatus}</Badge>
                }

                {props.showProgress &&
                    <>
                    <Progress className="mb-3" progress={props.totalPages === 0 ? 0 : Math.round((100 * props.currentPage) / props.totalPages)} size="md" labelProgress textLabel={t("book.update_reading.reading_progress")} labelText textLabelPosition="outside" progressLabelPosition="outside" />
                    <div className='flex flex-row items-center'>
                        <div className="grow">
                            <UpdateReadingStatusButton currentPage={props.currentPage} totalPages={props.totalPages} id={props.internalID} title={props.title} rating={props.rating} onSucess={props.onReadingStatusChanged}/>
                        </div>
                        <ActionsBookLibraryButton id={props.internalID} onSuccess={props.onReadingStatusChanged} allowNoteEditing={props.allowNoteEditing} totalPages={props.totalPages}/>
                    </div>
                    </>
                }
                <div className="flex flex-row justify-between">
                {props.showRating &&
                    <BookRating id={props.internalID} title={props.title} rating={props.rating} disableGiveRating={props.disableGiveRating} />
                }
                {props.showNotes &&
                    (props.notes > 0 &&
                        <NotesIcon id={props.internalID} notes={props.notes} allowEditing={props.allowNoteEditing} overrideNotes={props.overrideNotes} />
                    )
                }
                </div>
                {props.showOptions &&
                    <div className="flex flex-row-reverse">
                        <ActionsBookLibraryButton id={props.internalID} onSuccess={props.onReadingStatusChanged} allowNoteEditing={props.allowNoteEditing} totalPages={props.totalPages}/>
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
    showRating: true,
    disableGiveRating: false,
    showNotes:true,
    allowNoteEditing: true,
}

export default BookItem