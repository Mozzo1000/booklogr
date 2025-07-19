import React, {useState} from 'react'
import { Card, Badge, Button, Modal, ModalHeader, ModalBody} from "flowbite-react";
import { RiDoubleQuotesR } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiEditBoxLine } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiStickyNoteLine } from "react-icons/ri";
import NotesService from '../services/notes.service';
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';
import { RiErrorWarningLine } from 'react-icons/ri';
import EditNoteModal from './EditNoteModal';
import {formatDateTime} from "../DateFormat";

function NotesItem({ id, content, visibility, page, date, allowEditing, onDelete, onEdit}) {
    const [removalConfModal, setRemovalConfModal] = useState();
    const [openEditNote, setOpenEditNote] = useState(false);
    
    const toast = useToast(4000);
    const { t } = useTranslation();

    const getType = () => {
        if (page && page > 0) {
            return t("notes.quote");
        } else {
            return t("notes.note");
        }
    }

    const removeNote = () => {
        NotesService.remove(id).then(
            response => {
                toast("success", response.data.message)
                onDelete();
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
            }
        )
        setRemovalConfModal(false);
    }

    function formatVisibility(value) {
        const visibilityMap = {
            hidden: t("forms.visibility_hidden").toLowerCase(),
            public: t("forms.visibility_public").toLowerCase()
        };
        return visibilityMap[value] || value;
    }

    return (
        <>
        <Card>
            <div className="flex flex-row items-center justify-between">
                <div className="flex justify-start gap-2 items-center">
                    {getType() === t("notes.quote") ? (
                        <RiDoubleQuotesR size={20} className="dark:text-white"/>
                    ): (
                        <RiStickyNoteLine size={20} className="dark:text-white"/>
                    )}
                    <Badge color="dark">{getType()}</Badge>
                    <Badge color="light">{formatVisibility(visibility)}</Badge>
                </div>
                {allowEditing &&
                    <div className="flex justify-end gap-2 items-center">
                        <Button size="xs" color="light" outline className="hover:bg-gray-100 dark:hover:bg-gray-500" onClick={() => setOpenEditNote(true)}>
                            <RiEditBoxLine  className="w-5 h-5 dark:text-white"/>
                        </Button>          
                        <Button size="xs" color="light" outline className="hover:bg-gray-100 dark:hover:bg-gray-500" onClick={() => setRemovalConfModal(true)}>
                            <RiDeleteBin6Line className="w-5 h-5 text-red-600" />
                        </Button>  
                    </div>
                }
            </div>
            <div>
                <p className="format dark:format-invert">{content}</p>
            </div>
            <div className="w-full flex flex-row items-center justify-between">
                {page && page > 0 ? (
                    <div className="flex justify-start gap-2 items-center ">
                        <RiBookOpenLine  className="text-gray-500"/>
                        <p className="format dark:format-invert text-sm">{t("notes.page")} {page}</p>
                    </div>
                ): (
                    <span></span>
                )}
                <div className="flex justify-end items-center">
                    <p className="format dark:format-invert text-sm">{formatDateTime(new Date(date))}</p>
                </div>
            </div>
        </Card>
        
        {/* REMOVE NOTE CONFIRMATION DIALOG */}
        <Modal show={removalConfModal} size="md" onClose={() => setRemovalConfModal(false)} popup>
        <ModalHeader />
            <ModalBody>
            <div className="text-center">
                <RiErrorWarningLine className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    {t("notes.remove_confirmation.title")}
                </h3>
                <div className="flex justify-center gap-4">
                <Button color="red" onClick={() => removeNote()}>
                    {t("notes.remove_confirmation.yes")}
                </Button>
                <Button color="light" onClick={() => setRemovalConfModal(false)}>
                    {t("notes.remove_confirmation.no")}
                </Button>
                </div>
            </div>
            </ModalBody>
        </Modal>

        <EditNoteModal open={openEditNote} setOpen={setOpenEditNote} noteID={id} content={content} page={page} visibility={visibility} onSave={onEdit} />
        </>
  )
}

export default NotesItem