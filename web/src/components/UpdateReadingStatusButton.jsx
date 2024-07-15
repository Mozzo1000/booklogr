import React, { useState }  from 'react'
import { Button, TextInput, Modal } from 'flowbite-react'
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
            <Button color="light" pill size="sm" onClick={() => setOpenModal(true)}>Update progress</Button>
            <Modal size="lg" show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Update reading progress</Modal.Header>
                <Modal.Body>
                <div className="space-y-6">
                    <p className="flex items-center gap-2">{<RiBookOpenLine />} {props.title}</p>
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

            <Modal show={openFinishModal} onClose={() => (setOpenFinishModal(false), props.onSucess())} popup>
                <Modal.Header />
                <Modal.Body>
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
                </Modal.Body>
                <Modal.Footer className="flex justify-center gap-4">
                    <Button as={Link} to={"https://mastodonshare.com/?text=I just finished reading " + props.title  + " 📖&url=https://booklogr.app/books/" + props.id} target='_blank'>
                        <RiMastodonFill className="mr-2 h-5 w-5" />
                        Share on Mastodon
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default UpdateReadingStatusButton