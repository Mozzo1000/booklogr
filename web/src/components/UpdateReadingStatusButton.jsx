import React, { useState }  from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import Confetti from 'react-confetti'
import { RiMastodonFill } from "react-icons/ri";
import { Link } from 'react-router-dom';
import BookRating from './Library/BookRating';
import UpdateReadingStatusView from './UpdateReadingStatusView';

function UpdateReadingStatusButton(props) {
    const [openModal, setOpenModal] = useState(false);
    const [openFinishModal, setOpenFinishModal] = useState(false);

    const [updatedProgress, setUpdatedProgress] = useState(props.currentPage || 0);
    const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false);

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
                setOpenFinishModal(true);
            }
        )
    }    

    return (
        <>
            {props.buttonStyle == "alternative" ? (
                <Button onClick={() => setOpenModal(true)}>Update progress</Button>
            ) :(
                <Button color="light" pill size="sm" onClick={() => setOpenModal(true)}>Update progress</Button>
            )}
            <Modal size="lg" show={openModal} onClose={() => setOpenModal(false)}>
            <ModalHeader className="border-gray-200">Update reading progress</ModalHeader>
                <ModalBody>
                    <UpdateReadingStatusView title={props.title} totalPages={props.totalPages} 
                        onNoProgressError={() => setUpdateButtonDisabled(false)}
                        onProgressLesserError={() => setUpdateButtonDisabled(true)}
                        onProgressGreaterError={() => setUpdateButtonDisabled(true)}
                        updatedProgress={updatedProgress}
                        setUpdatedProgress={setUpdatedProgress}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => updateProgress()} disabled={updateButtonDisabled}>Update</Button>
                    <Button color="alternative" onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button color="alternative" onClick={() => setFinished()}>Set as finished</Button>
                </ModalFooter>
            </Modal>

            <Modal show={openFinishModal} onClose={() => (setOpenFinishModal(false), props.onSucess())} popup>
                <ModalHeader />
                <ModalBody>
                    <Confetti width={"640"} height={386} recycle={false} />
                    <div className="flex flex-col items-center justify-center text-center gap-2">
                        <img src={"/medal.svg"} width={140} height={140}/>
                        <div className="format lg:format-lg">
                            <h2>Congratulations!</h2>
                            <p>On finishing reading <strong>{props.title}</strong></p>
                            
                        </div>
                        <div className="flex flex-col items-center">
                            <p>Rate this book</p>
                            <BookRating size={"lg"} id={props.id} title={props.title} rating={props.rating} />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="flex justify-center gap-4">
                    <Button as={Link} to={"https://mastodonshare.com/?text=I just finished reading " + props.title  + " 📖&url=https://booklogr.app/books/" + props.id} target='_blank'>
                        <RiMastodonFill className="mr-2 h-5 w-5" />
                        Share on Mastodon
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default UpdateReadingStatusButton