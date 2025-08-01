import React, { useState } from 'react'
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { FaEllipsisVertical } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import NotesView from './NotesView';
import { RiStickyNoteLine } from "react-icons/ri";
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import RemoveBookModal from './RemoveBookModal';
import EditBookModal from './Library/EditBookModal';
import { RiBallPenLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';

function ActionsBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const [openNotesModal, setOpenNotesModal] = useState();
    const [openRemoveModal, setOpenRemoveModal] = useState();
    const [openEditBookModal, setOpenEditBookModal] = useState();

    const toast = useToast(4000);
    const { t } = useTranslation();

    const changeStatus = (statusChangeTo) => {
        BooksService.edit(props.id, {status: statusChangeTo}).then(
            response => {
                toast("success", response.data.message);
                props.onSuccess();
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
    }

    const clickDropItem = (stateStatus) => {
        setStatus(stateStatus);
        changeStatus(stateStatus);
    }

    return (
        <>
        <Dropdown label="" dismissOnClick={false} renderTrigger={() => <span className="hover:cursor-pointer"><FaEllipsisVertical className="dark:text-white"/></span>}>
            <DropdownHeader>
                <span className="block text-sm font-bold">{t("reading_status.title")}</span>
            </DropdownHeader>
            <DropdownItem onClick={() => (clickDropItem("Currently reading"))}><RiBookOpenLine size={18} className="mr-1"/>{t("reading_status.currently_reading")}</DropdownItem>
            <DropdownItem onClick={() => (clickDropItem("To be read"))}><RiBookmarkLine size={18} className="mr-1"/>{t("reading_status.to_be_read")}</DropdownItem>
            <DropdownItem onClick={() => (clickDropItem("Read"))}><RiBook2Line size={18} className="mr-1"/>{t("reading_status.read")}</DropdownItem>
            <DropdownDivider />

            <DropdownItem onClick={() => setOpenNotesModal(true)}><RiStickyNoteLine size={18} className="mr-1"/>{t("notes.title")}</DropdownItem>
            <DropdownItem onClick={() => setOpenEditBookModal(true)}><RiBallPenLine size={18} className="mr-1"/>{t("actions.edit_book")}</DropdownItem>
            <DropdownItem onClick={() => setOpenRemoveModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />{t("forms.remove")}</DropdownItem>
        </Dropdown>
        
        <NotesView id={props.id} open={openNotesModal} setOpen={setOpenNotesModal} allowEditing={props.allowNoteEditing}/>
        <RemoveBookModal id={props.id} open={openRemoveModal} close={setOpenRemoveModal} onSuccess={props.onSuccess}/>
        <EditBookModal id={props.id} totalPages={props.totalPages} open={openEditBookModal} close={setOpenEditBookModal} onSuccess={props.onSuccess} />
        </>
    )
}

ActionsBookLibraryButton.defaultProps = {
    allowNoteEditing: true,
}

export default ActionsBookLibraryButton