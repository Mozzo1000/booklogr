import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, Select, ButtonGroup, Dropdown, DropdownItem, DropdownHeader, DropdownDivider} from "flowbite-react";
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import UpdateReadingStatusButton from './UpdateReadingStatusButton';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";

function AddToReadingListButton(props) {
    const [readingStatus, setReadingStatus] = useState();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState();
    const [openModalReading, setOpenModalReading] = useState(false);
    const [readID, setReadID] = useState();
    const toast = useToast(4000);

    const handleSave = (status, current_page) => {
        var arr = {}
        arr.title = props.data?.title;
        arr.isbn = props.isbn;
        arr.author = props.data?.author_name?.[0]; //Authors object from the API can have more than one object inside.. fix this later by flattening and getting a list of all authors names.
        if (props.description) {
            arr.description = props.description;
        }
        if (readingStatus) {
            arr.reading_status = readingStatus;
        }
        
        if (currentPage) {
            arr.current_page = currentPage;
        }

        if (totalPages) {
            arr.total_pages = totalPages;
        }

        if (status) {
            arr.reading_status = status;
        }
        if (current_page) {
            arr.current_page = current_page;
        }

        BooksService.add(arr).then(
            response => {
                toast("success", response.data.message);
                updateReadStatus();
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

    const editRead = (status, current_page) => {
        setOpenModalReading(false);
        if (!status) {
            status = readingStatus;
        }
        if (!current_page) {
            current_page = currentPage;
        }
        if (readID) {
            BooksService.edit(readID, {"status": status, "current_page": current_page}).then(
                response => {
                    setReadingStatus(status);
                    toast("success", response.data.message);
                    setOpenModalReading(false);
                }
            )
        } else {
            setReadingStatus(status);
            setCurrentPage(current_page);
            handleSave(status, current_page);
        }
    }

    useEffect(() => {
      setTotalPages(props.data?.number_of_pages_median)
      updateReadStatus();
      console.log(props.data)
    }, [props.data])

    const updateReadStatus = () => {
        BooksService.status(props.isbn).then(
            response => {
                setReadingStatus(response.data.reading_status)
                setReadID(response.data.id);
            },
            error => {
              const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
              if (error.response.status != 404) {
                toast("error", resMessage);
              }
            }
        )
    }
    
    const handleSetReadingToBeRead = () => {
        setReadingStatus("To be read");
        editRead("To be read");
    }

    const handleSetReadingCurrentlyReading = () => {
        setReadingStatus("Currently reading")
        setOpenModalReading(true);
    }
    const handleSetReadingRead = () => {
        setReadingStatus("Read");
        setCurrentPage(totalPages);
        editRead("Read", totalPages);
    }
    
    return (
        <div>
            <Modal show={openModalReading} onClose={() => setOpenModalReading(false)}>
                <ModalHeader className="border-gray-200">Add {props.data?.title} to currently reading</ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        <div>
                            <div className="mb-2 block ">
                                <Label className="font-bold" htmlFor="currentPage">Progress</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <TextInput id="currentPage" type="text" placeholder="0" value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} />
                                <p>out of {totalPages} pages</p>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                <Button onClick={() => editRead()}>Save</Button>
                <Button color="alternative" onClick={() => setOpenModalReading(false)}>
                    Close
                </Button>
                </ModalFooter>
            </Modal>

            <ButtonGroup outline>
                {(() => {
                    if (readingStatus === "To be read") {
                        return <Button onClick={() => handleSetReadingCurrentlyReading()}><RiBookOpenLine className="mr-2 h-5 w-5" />Currently reading</Button>;
                    } else if (readingStatus === "Currently reading") {
                        return <UpdateReadingStatusButton totalPages={totalPages} id={readID} title={props.data?.title} rating={0} buttonStyle={"alternative"}/>
                    } else if (readingStatus === "Read") {
                        return <Button disabled><RiBook2Line className="mr-2 h-5 w-5" />Read</Button>;
                    }else {
                        return <Button onClick={() => handleSetReadingToBeRead()}><RiBookmarkLine className="mr-2 h-5 w-5" />Want to read</Button>;
                    }
                })()}
        
                <Dropdown>
                    {(() => {
                        if (readingStatus === "To be read") {
                            return <>
                                <DropdownHeader ><span className="block text-sm opacity-50">Want to read</span></DropdownHeader>
                                <DropdownDivider />
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead() }>Read</DropdownItem>
                            </>;
                        } else if (readingStatus === "Currently reading") {
                            return <>
                                <DropdownHeader><span className="block text-sm opacity-50">Currently reading</span></DropdownHeader>
                                <DropdownDivider />
                                <DropdownItem icon={RiBookmarkLine} onClick={() => handleSetReadingToBeRead() }>Want to read</DropdownItem>
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead() }>Read</DropdownItem>
                            </>;
                        } else if (readingStatus === "Read") {
                            return <>
                                <DropdownItem icon={RiBookmarkLine} onClick={() => handleSetReadingToBeRead() }>Want to read</DropdownItem>
                                <DropdownItem icon={RiBookOpenLine} onClick={() => handleSetReadingCurrentlyReading() }>Currently reading</DropdownItem>

                            </>;
                        }else {
                            return <>
                                <DropdownItem icon={RiBookOpenLine} onClick={() => handleSetReadingCurrentlyReading()}>Currently reading</DropdownItem>
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead()}>Read</DropdownItem>
                            </>;
                        }
                    })()}
                    
                </Dropdown>
            </ButtonGroup>


        </div>
    )
}

export default AddToReadingListButton