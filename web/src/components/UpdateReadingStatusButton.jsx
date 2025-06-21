import React, { useState, useEffect }  from 'react'
import { Button, TextInput, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { RiBookOpenLine } from "react-icons/ri";
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import Confetti from 'react-confetti'
import { RiMastodonFill } from "react-icons/ri";
import { Link } from 'react-router-dom';
import BookRating from './Library/BookRating';

function UpdateReadingStatusButton(props) {
    const [openModal, setOpenModal] = useState(false);
    const [openFinishModal, setOpenFinishModal] = useState(false);

    const [updatedProgress, setUpdatedProgress] = useState();
    const [progressErrorText, setPasswordErrorText] = useState();
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

    useEffect(() => {
        if (updatedProgress > props.totalPages) {
            setPasswordErrorText("Current page cannot be greater than total pages.");
            setUpdateButtonDisabled(true);
        } else if (updatedProgress < 0) {
            setPasswordErrorText("Current page cannot be less than 0.");
            setUpdateButtonDisabled(true);
        } else {
            setPasswordErrorText();
            setUpdateButtonDisabled(false);
        }
      }, [updatedProgress])
    
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
            <Button color="light" pill size="sm" onClick={() => setOpenModal(true)}>Update progress</Button>
            <Modal size="lg" show={openModal} onClose={() => setOpenModal(false)}>
            <ModalHeader className="border-gray-200">Update reading progress</ModalHeader>
                <ModalBody>
                <div className="space-y-6">
                    <p className="flex items-center gap-2">{<RiBookOpenLine />} {props.title}</p>
                    <div className="flex items-center gap-2">
                        <p>I am on page</p>
                        <TextInput sizing="sm" value={updatedProgress} onChange={(e) => setUpdatedProgress(e.target.value)} color={progressErrorText ? 'failure' : 'gray'}/>
                        <p>out of {props.totalPages}</p>
                        
                    </div>
                    <span className="text-red-600 text-sm">
                        {progressErrorText}
                    </span>
                </div>
                </ModalBody>
                <ModalFooter>
                <Button onClick={() => updateProgress()} disabled={updateButtonDisabled}>Update</Button>
                <Button color="gray" onClick={() => setOpenModal(false)}> Cancel </Button>
                <Button color="gray" onClick={() => setFinished()}>Set as finished</Button>
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