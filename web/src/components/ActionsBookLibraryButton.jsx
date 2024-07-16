import React, { useState } from 'react'
import { Dropdown, Modal, Button } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { FaEllipsisVertical } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiErrorWarningLine } from "react-icons/ri";
import NotesView from './NotesView';
import { RiStickyNoteLine } from "react-icons/ri";

function ActionsBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const [removalConfModal, setRemovalConfModal] = useState();
    const [openNotesModal, setOpenNotesModal] = useState();
    const toast = useToast(4000);

    const changeStatus = (statusChangeTo) => {
        console.log(props.id)
        console.log(statusChangeTo)
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
            <Dropdown.Header>
                <span className="block text-sm font-medium">Reading status</span>
                <Dropdown.Divider/>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => (clickDropItem("Currently reading"))}>Currently reading</Dropdown.Item>
            <Dropdown.Item onClick={() => (clickDropItem("To be read"))}>To be read</Dropdown.Item>
            <Dropdown.Item onClick={() => (clickDropItem("Read"))}>Read</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setOpenNotesModal(true)}><RiStickyNoteLine className="mr-1"/>Notes</Dropdown.Item>
            <Dropdown.Item onClick={() => setRemovalConfModal(true)}><RiDeleteBin6Line className="mr-1" />Remove</Dropdown.Item>
        </Dropdown>

        {/* REMOVE BOOK CONFIRMATION DIALOG */}
        <Modal show={removalConfModal} size="md" onClose={() => setRemovalConfModal(false)} popup>
        <Modal.Header />
            <Modal.Body>
            <div className="text-center">
                <RiErrorWarningLine className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to remove this book?
                </h3>
                <div className="flex justify-center gap-4">
                <Button color="failure" onClick={() => removeBook()}>
                    {"Yes, I'm sure"}
                </Button>
                <Button color="gray" onClick={() => setRemovalConfModal(false)}>
                    {"No, cancel"}
                </Button>
                </div>
            </div>
            </Modal.Body>
        </Modal>
        <NotesView id={props.id} open={openNotesModal} close={setOpenNotesModal} />
        </>
    )
}

export default ActionsBookLibraryButton