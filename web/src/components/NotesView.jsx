import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem, Dropdown, DropdownHeader, DropdownItem, TextInput, Textarea, Tooltip  } from 'flowbite-react'
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
    const [quoteCreationMode, setQuoteCreationMode] = useState(false);
    const [newNote, setNewNote] = useState();
    const [newQuotePage, setNewQuotePage] = useState();
    const [filter, setFilter] = useState("all");

    const toast = useToast(4000);

    function getNotes() {
        if(props.overrideNotes) {
            setNotes(props.overrideNotes)
            setSelectedNote(props.overrideNotes[0])
        } else {
            BooksService.notes(props.id).then(
                response => {
                    setNotes(response.data)
                    setSelectedNote(response.data[0])
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
        BooksService.addNote(props.id, {"content": newNote, "quote_page": newQuotePage}).then(
            response => {
                toast("success", response.data.message)
                getNotes();
                setCreationMode(false);
                setQuoteCreationMode(false);
                setNewQuotePage();
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
                setCreationMode(false);
                setQuoteCreationMode(false);
                setNewQuotePage();
                setNewNote();
            }
        )
    }

    const listNotes = (item) => {
        return (
            item &&
            <ListGroupItem active={item.id == selectedNote.id} icon={RiStickyNoteLine} onClick={() => (setSelectedNote(item), setCreationMode(false), setQuoteCreationMode(false))}>
                <div className="flex flex-col gap-2 items-start">
                    <div>
                        {new Date(item.created_on).toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}
                    </div>
                    <div className="flex flex-row gap-2">
                        <div>
                            {item.visibility}
                        </div>
                        <div>
                            {item.quote_page ? (
                                <p>Quote</p>
                            ): (
                                <p>Note</p>
                            )}
                            
                        </div>
                    </div>
                </div>
            </ListGroupItem>
        )
    };
    
    return (
        <>
        <Modal size={"5xl"} position={"top-center"} show={props.open} onClose={() => props.close(false)}>
        <ModalHeader className="border-gray-200">Notes & Quotes</ModalHeader>
            <ModalBody>
                <div className="grid grid-cols-3 gap-4">
                {notes?.length > 0 ? (
                    <div>
                        <div className="flex flex-col gap-4">
                        <ButtonGroup>
                            <Button color="alternative" onClick={(e) => setFilter("all")} className={`${filter == "all" ? 'text-cyan-700' : 'text-gray-900'}`}>All</Button>
                            <Button color="alternative" onClick={(e) => setFilter("notes")} className={`${filter == "notes" ? 'text-cyan-700' : 'text-gray-900'}`}>Notes</Button>
                            <Button color="alternative" onClick={(e) => setFilter("quotes")} className={`${filter == "quotes" ? 'text-cyan-700' : 'text-gray-900'}`}>Quotes</Button>
                        </ButtonGroup>
                        <ListGroup className="w-full">
                            {notes?.map((item) => {
                                return (
                                    (item?.id &&
                                        filter == "quotes" ? (
                                            item?.quote_page && (
                                                listNotes(item)
                                        )
                                        ): filter == "notes" ? (
                                            !item?.quote_page && (
                                                listNotes(item)
                                            )
                                        ): (
                                            listNotes(item)
                                        )
                                    )
                                )
                            })}
                        </ListGroup>
                        {props.allowEditing &&
                            <div className="flex flex-row gap-2 justify-between">
                                <Button color="alternative" onClick={() => (setCreationMode(true), setQuoteCreationMode(false))}>Add note</Button>
                                <Button color="alternative" onClick={() => (setCreationMode(true), setQuoteCreationMode(true))}>Add quote</Button>
                            </div>
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
                                    <p>There does not seem to be any notes or quotes for this book.</p>
                                </div>
                                <div className="inline-flex gap-4">
                                    <Button onClick={() => setCreationMode(true)}>Add note</Button>
                                    <Button onClick={() => (setCreationMode(true), setQuoteCreationMode(true))}>Add quote</Button>
                                </div>
                            </div>
                        </div>
                        )
                    )}
                    <div className={`${creationMode && notes?.length <= 0 ? "col-span-3" : "col-span-2"}`}>
                        <div className="flex flex-col gap-2 h-full">
                            <div className="basis-full">
                                {!creationMode ? (
                                    <div className="flex flex-col gap-2">
                                        {selectedNote?.quote_page &&
                                            <div>
                                                <p>Page: {selectedNote?.quote_page}</p>
                                            </div>
                                        }
                                        <div>
                                            {selectedNote?.content}
                                        </div>
                                    </div>
                                ):(
                                    <>
                                    <div className="format lg:format-lg">
                                        {quoteCreationMode ? (
                                            <p>Add quote</p>
                                        ): (
                                            <p>Add note</p>
                                        )}
                                    </div>
                                    <Textarea required autoFocus rows={6} value={newNote} onChange={(e) => setNewNote(e.target.value)}/>
                                    {quoteCreationMode &&
                                        <div className="flex flex-col gap-2">
                                            <p>Page:</p>
                                            <TextInput  type='number' required value={newQuotePage} onChange={(e) => setNewQuotePage(e.target.value)}/>
                                        </div>
                                    }
                                    </>
                                )}
                            </div>
                            <div className="flex flex-row justify-end gap-4">
                                {!creationMode && props.allowEditing && notes?.length > 0 ? (
                                    <>
                                    <Tooltip content="Change visibility">
                                        <Dropdown color="alternative" label={<RiEyeLine className="h-5 w-5"/>}>
                                            <DropdownHeader>Change visibility</DropdownHeader>
                                            <DropdownItem onClick={() => changeVisibility("hidden")}>Hidden</DropdownItem>
                                            <DropdownItem onClick={() => changeVisibility("public")}>Public</DropdownItem>
                                        </Dropdown>
                                    </Tooltip>
                                    <Tooltip content="Remove">
                                        <Button className="hover:cursor-pointer" color="failure" onClick={() => setRemovalConfModal(true)}>
                                            <RiDeleteBin6Line className="h-5 w-5" />
                                        </Button>
                                    </Tooltip>
                                    </>
                                ): (
                                    (creationMode &&
                                    <>
                                    <Button color="gray" onClick={() => (setCreationMode(false), setQuoteCreationMode(false), setNewNote())}>Cancel</Button>
                                    <Button onClick={() => addNote()}>Save</Button>
                                    </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>
        </Modal>

        {/* REMOVE NOTE CONFIRMATION DIALOG */}
        <Modal show={removalConfModal} size="md" onClose={() => setRemovalConfModal(false)} popup>
        <ModalHeader />
            <ModalBody>
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
            </ModalBody>
        </Modal>
        </>
    )
}


NotesView.defaultProps = {
    overrideNotes: undefined,
    allowEditing: true,
}

export default NotesView