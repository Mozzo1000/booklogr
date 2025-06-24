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

function ActionsBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const [openNotesModal, setOpenNotesModal] = useState();
    const [openRemoveModal, setOpenRemoveModal] = useState();
    const [openEditBookModal, setOpenEditBookModal] = useState();

    const toast = useToast(4000);

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
        <Dropdown label="" dismissOnClick={false} renderTrigger={() => <span className="hover:cursor-pointer"><FaEllipsisVertical /></span>}>
            <DropdownHeader>
                <span className="block text-sm font-bold">Reading status</span>
            </DropdownHeader>
            <DropdownItem onClick={() => (clickDropItem("Currently reading"))}><RiBookOpenLine size={18} className="mr-1"/>Currently reading</DropdownItem>
            <DropdownItem onClick={() => (clickDropItem("To be read"))}><RiBookmarkLine size={18} className="mr-1"/>To be read</DropdownItem>
            <DropdownItem onClick={() => (clickDropItem("Read"))}><RiBook2Line size={18} className="mr-1"/>Read</DropdownItem>
            <DropdownDivider />

            <DropdownItem onClick={() => setOpenNotesModal(true)}><RiStickyNoteLine size={18} className="mr-1"/>Notes & Quotes</DropdownItem>
            <DropdownItem onClick={() => setOpenEditBookModal(true)}><RiBallPenLine size={18} className="mr-1"/>Edit book</DropdownItem>
            <DropdownItem onClick={() => setOpenRemoveModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />Remove</DropdownItem>
        </Dropdown>
        
        <NotesView id={props.id} open={openNotesModal} close={setOpenNotesModal} allowEditing={props.allowNoteEditing}/>
        <RemoveBookModal id={props.id} open={openRemoveModal} close={setOpenRemoveModal} onSuccess={props.onSuccess}/>
        <EditBookModal id={props.id} totalPages={props.totalPages} open={openEditBookModal} close={setOpenEditBookModal} onSuccess={props.onSuccess} />
        </>
    )
}

ActionsBookLibraryButton.defaultProps = {
    allowNoteEditing: true,
}

export default ActionsBookLibraryButton