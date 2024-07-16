import { Button, Modal, ListGroup, Dropdown, TextInput, Textarea  } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import BooksService from '../services/books.service';
import { RiStickyNoteLine } from "react-icons/ri";
import { RiEyeLine } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import NotesService from '../services/notes.service';
import useToast from '../toast/useToast';
import { RiErrorWarningLine } from "react-icons/ri";

function NotesView(props) {
    const [notes, setNotes] = useState();
    const [selectedNote, setSelectedNote] = useState();
    const [removalConfModal, setRemovalConfModal] = useState();
    const [creationMode, setCreationMode] = useState(false);
    const [newNote, setNewNote] = useState();
    const toast = useToast(4000);

    function getNotes() {
        if(props.overrideNotes) {
            setNotes(props.overrideNotes)
            setSelectedNote(props.overrideNotes[0])
            console.log(props.overrideNotes)
        } else {
            BooksService.notes(props.id).then(
                response => {
                    setNotes(response.data)
                    setSelectedNote(response.data[0])
                    console.log(response.data)
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
    }

    useEffect(() => {
        if(props.open) {
            getNotes()
        }
    }, [props.open])

    const changeVisibility = (visibility) => {
        NotesService.edit(selectedNote.id, {"visibility": visibility}).then(
            response => {
                toast("success", response.data.message)
                getNotes()
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

    const removeNote = () => {
        NotesService.remove(selectedNote.id).then(
            response => {
                toast("success", response.data.message)
                getNotes()
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

    const addNote = () => {
        BooksService.addNote(props.id, {"content": newNote}).then(
            response => {
                toast("success", response.data.message)
                getNotes()
                setCreationMode(false)
                setNewNote();
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
                setCreationMode(false)
                setNewNote();
            }
        )
    }
    
    return (
        <>
        <Modal size={"5xl"} position={"top-center"} show={props.open} onClose={() => props.close(false)}>
        <Modal.Header>Notes</Modal.Header>
            <Modal.Body>
                <div className="grid grid-cols-3 gap-4">
                {notes?.length > 0 ? (
                    <div>
                        <div className="flex flex-col gap-4">
                        <ListGroup className="w-full">
                            {notes?.map((item) => {
                                return (
                                    (item?.id &&
                                    <ListGroup.Item active={item.id == selectedNote.id} icon={RiStickyNoteLine} onClick={() => setSelectedNote(item)}>
                                        <div className="flex flex-col gap-2 items-start">
                                            <div>
                                                {new Date(item.created_on).toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}
                                            </div>
                                            <div>
                                                {item.visibility}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    )
                                )
                            })}
                        </ListGroup>
                        {props.allowEditing &&
                            <Button color="gray" onClick={() => setCreationMode(true)}>Add</Button>
                        }
                        </div>
                    </div>
                    ):(
                        (!creationMode &&
                        <div className="col-span-3">
                            <div className="grid grid-cols-1 grid-rows-3 place-items-center justify-center items-center text-center">
                                <RiStickyNoteLine size={96}/>
                                <div className="format lg:format-lg">
                                    <h2>No notes found</h2>
                                    <p>There does not seem to be any notes for this book.</p>
                                </div>
                                <Button onClick={() => setCreationMode(true)}>Add note</Button>
                            </div>
                        </div>
                        )
                    )}
                    <div className={`${creationMode && notes?.length <= 0 ? "col-span-3" : "col-span-2"}`}>
                        <div className="flex flex-col gap-2 h-full">
                            <div className="basis-full">
                                {!creationMode ? (
                                    selectedNote?.content
                                ):(
                                    <>
                                    <div className="format lg:format-lg">
                                        <p>Add note</p>
                                    </div>
                                    <Textarea required autoFocus rows={6} value={newNote} onChange={(e) => setNewNote(e.target.value)}/>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-row justify-end gap-4">
                                {!creationMode && props.allowEditing && notes?.length > 0 ? (
                                    <>
                                    <Dropdown color="gray" label={<RiEyeLine className="h-5 w-5"/>}>
                                        <Dropdown.Header>Change visibility</Dropdown.Header>
                                        <Dropdown.Item onClick={() => changeVisibility("hidden")}>Hidden</Dropdown.Item>
                                        <Dropdown.Item onClick={() => changeVisibility("public")}>Public</Dropdown.Item>
                                    </Dropdown>
                                    <Button color="failure" onClick={() => setRemovalConfModal(true)}>
                                        <RiDeleteBin6Line className="h-5 w-5" />
                                    </Button>
                                    </>
                                ): (
                                    (creationMode &&
                                    <>
                                    <Button color="gray" onClick={() => (setCreationMode(false), setNewNote())}>Cancel</Button>
                                    <Button onClick={() => addNote()}>Save</Button>
                                    </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        {/* REMOVE NOTE CONFIRMATION DIALOG */}
        <Modal show={removalConfModal} size="md" onClose={() => setRemovalConfModal(false)} popup>
        <Modal.Header />
            <Modal.Body>
            <div className="text-center">
                <RiErrorWarningLine className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to remove this note?
                </h3>
                <div className="flex justify-center gap-4">
                <Button color="failure" onClick={() => removeNote()}>
                    {"Yes, I'm sure"}
                </Button>
                <Button color="gray" onClick={() => setRemovalConfModal(false)}>
                    {"No, cancel"}
                </Button>
                </div>
            </div>
            </Modal.Body>
        </Modal>
        </>
    )
}


NotesView.defaultProps = {
    overrideNotes: undefined,
    allowEditing: true,
}

export default NotesView