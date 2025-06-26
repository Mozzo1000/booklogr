import React, { useState, useEffect, useRef }  from 'react'
import { Button, TextInput, Modal, ModalHeader, ModalBody, ModalFooter, Label, TabItem, Tabs  } from 'flowbite-react'
import { RiBookOpenLine } from "react-icons/ri";
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import Confetti from 'react-confetti'
import { RiMastodonFill } from "react-icons/ri";
import { Link } from 'react-router-dom';
import BookRating from './Library/BookRating';
import { RiPercentLine } from "react-icons/ri";

function UpdateReadingStatusButton(props) {
    const [openModal, setOpenModal] = useState(false);
    const [openFinishModal, setOpenFinishModal] = useState(false);

    const [updatedProgress, setUpdatedProgress] = useState(props.currentPage || 0);
    const [percentage, setPercentage] = useState(0);
    const [progressErrorText, setPasswordErrorText] = useState();
    const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false);
    const tabsRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);

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
        setPercentage(((updatedProgress / props.totalPages) * 100).toFixed(0));
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

    useEffect(() => {
      if (activeTab == 0) {
        localStorage.setItem("use_percentage_book_read", false)
      }else if (activeTab == 1) {
        localStorage.setItem("use_percentage_book_read", true)
      }
    }, [activeTab])
    

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
                <div className="space-y-6">
                    <p className="flex items-center gap-2">How far are you in<p className="font-bold">{props.title}</p> ?</p>
                    <div className="overflow-x-auto">
                        <Tabs variant="fullWidth" ref={tabsRef} onActiveTabChange={(tab) => setActiveTab(tab)}>
                            <TabItem title="Pages" icon={RiBookOpenLine}>
                                <Label className="mb-0 block" htmlFor="input_page">Current page</Label>
                                <TextInput id="input_page" type="number" value={updatedProgress} onChange={(e) => setUpdatedProgress(e.target.value)} color={progressErrorText ? 'failure' : 'gray'}/>
                                <p className="pt-2 text-gray-500 text-sm">Progress: {percentage}%</p>
                            </TabItem>
                            <TabItem active={localStorage.getItem("use_percentage_book_read") === "true"} title="Percentage" icon={RiPercentLine}>
                                <Label className="mb-0 block" htmlFor="input_perc">Percentage complete</Label>
                                <TextInput id="input_perc" type="number" value={percentage} onChange={(e) => setUpdatedProgress(Math.round((e.target.value / 100) * props.totalPages))} color={progressErrorText ? 'failure' : 'gray'}/>
                                <p className="pt-2 text-gray-500 text-sm">Current page: {updatedProgress} of {props.totalPages}</p>
                            </TabItem>
                        </Tabs>
                        <p className="text-red-600 text-sm">
                            {progressErrorText}
                        </p>
                    </div>
                </div>
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