import React, { useState } from 'react'
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { FaEllipsisVertical } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiErrorWarningLine } from "react-icons/ri";
import NotesView from './NotesView';
import { RiStickyNoteLine } from "react-icons/ri";
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";

function ActionsBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const [removalConfModal, setRemovalConfModal] = useState();
    const [openNotesModal, setOpenNotesModal] = useState();
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

    const removeBook = () => {
        BooksService.remove(props.id).then(
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
        setRemovalConfModal(false);

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
            <DropdownItem onClick={() => setRemovalConfModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />Remove</DropdownItem>
        </Dropdown>

        {/* REMOVE BOOK CONFIRMATION DIALOG */}
        <Modal show={removalConfModal} size="md" onClose={() => setRemovalConfModal(false)} popup>
        <ModalHeader />
            <ModalBody>
            <div className="text-center">
                <RiErrorWarningLine className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to remove this book?
                </h3>
                <div className="flex justify-center gap-4">
                <Button color="red" onClick={() => removeBook()}>
                    {"Yes, I'm sure"}
                </Button>
                <Button color="alternative" onClick={() => setRemovalConfModal(false)}>
                    {"No, cancel"}
                </Button>
                </div>
            </div>
            </ModalBody>
        </Modal>
        <NotesView id={props.id} open={openNotesModal} close={setOpenNotesModal} allowEditing={props.allowNoteEditing}/>
        </>
    )
}

ActionsBookLibraryButton.defaultProps = {
    allowNoteEditing: true,
}

export default ActionsBookLibraryButton