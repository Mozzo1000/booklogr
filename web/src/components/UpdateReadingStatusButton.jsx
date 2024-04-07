import React, { useState }  from 'react'
import { Button, TextInput, Modal, Label } from 'flowbite-react'
import { SlBookOpen } from "react-icons/sl";
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';

function UpdateReadingStatusButton(props) {
    const [openModal, setOpenModal] = useState(false);
    const [updatedProgress, setUpdatedProgress] = useState();
    const toast = useToast(4000);

    const updateProgress = () => {
        BooksService.edit(props.id, {current_page: updatedProgress}).then(
            response => {
                toast("success", response.data.message);
                setOpenModal(false);
                props.onSucess()
            }
        )
    }
    
    const setFinished = () => {
        BooksService.edit(props.id, {current_page: props.totalPages, status: "Read"}).then(
            response => {
                toast("success", response.data.message);
                setOpenModal(false);
                props.onSucess()
            }
        )
    }

    return (
        <>
            <Button color="light" pill size="sm" onClick={() => setOpenModal(true)}>Update progress</Button>
            <Modal size="md" show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Update reading progress</Modal.Header>
                <Modal.Body>
                <div className="space-y-6">
                    <p className="flex items-center gap-2">{<SlBookOpen />} {props.title}</p>
                    <div className="flex items-center gap-2">
                        <p>I am on page</p>
                        <TextInput className=""sizing="sm" value={updatedProgress} onChange={(e) => setUpdatedProgress(e.target.value)} />
                        <p>out of {props.totalPages}</p>
                    </div>
                </div>
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={() => updateProgress()}>Update</Button>
                <Button color="gray" onClick={() => setOpenModal(false)}> Cancel </Button>
                <Button color="gray" onClick={() => setFinished()}>Set as finished</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default UpdateReadingStatusButton