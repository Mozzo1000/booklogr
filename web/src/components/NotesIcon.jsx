import React, { useState} from 'react'
import { RiStickyNoteLine } from "react-icons/ri";
import NotesView from './NotesView';
import { Tooltip } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function NotesIcon({id, notes, allowEditing, overrideNotes}) {
    const [openNotesModal, setOpenNotesModal] = useState();
    const { t } = useTranslation();

    return (
        <>
        <Tooltip content={t("notes.open")}>
            <div onClick={() => setOpenNotesModal(true)} className="flex flex-row gap-2 items-center hover:bg-gray-100 hover:cursor-pointer">
                <RiStickyNoteLine/>
                <p>{notes}</p>
            </div>
        </Tooltip>
        <NotesView id={id} open={openNotesModal} setOpen={setOpenNotesModal} allowEditing={allowEditing} overrideNotes={overrideNotes}/>
        </>
    )
}

export default NotesIcon