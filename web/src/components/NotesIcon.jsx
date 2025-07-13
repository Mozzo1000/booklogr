import React, { useState} from 'react'
import { RiStickyNoteLine } from "react-icons/ri";
import NotesView from './NotesView';
import { Tooltip } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function NotesIcon(props) {
    const [openNotesModal, setOpenNotesModal] = useState();
    const { t } = useTranslation();

    return (
        <>
        <Tooltip content={t("notes.open")}>
            <div onClick={() => setOpenNotesModal(true)} className="flex flex-row gap-2 items-center hover:bg-gray-100 hover:cursor-pointer">
                <RiStickyNoteLine/>
                <p>{props.notes}</p>
            </div>
        </Tooltip>
        <NotesView id={props.id} open={openNotesModal} close={setOpenNotesModal} overrideNotes={props.overrideNotes} allowEditing={props.allowNoteEditing}/>
        </>
    )
}

export default NotesIcon