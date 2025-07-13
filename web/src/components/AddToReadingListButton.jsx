import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, Select, ButtonGroup, Dropdown, DropdownItem, DropdownHeader, DropdownDivider} from "flowbite-react";
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import UpdateReadingStatusButton from './UpdateReadingStatusButton';
import { RiBook2Line } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { RiBookmarkLine } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import RemoveBookModal from './RemoveBookModal';
import UpdateReadingStatusView from './UpdateReadingStatusView';
import { useTranslation, Trans } from 'react-i18next';

function AddToReadingListButton(props) {
    const [readingStatus, setReadingStatus] = useState();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState();
    const [openModalReading, setOpenModalReading] = useState(false);
    const [readID, setReadID] = useState();
    const [openRemoveModal, setOpenRemoveModal] = useState();
    const toast = useToast(4000);
    const { t } = useTranslation();

    const handleSave = (status, current_page) => {
        var arr = {}
        arr.title = props.data?.title;
        arr.isbn = props.isbn;
        arr.author = props.author;
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
      setTotalPages(props.data?.number_of_pages)
      updateReadStatus();
    }, [props.data])

    const updateReadStatus = () => {
        BooksService.status(props.isbn).then(
            response => {
                setReadingStatus(response.data.reading_status);
                setReadID(response.data.id);
                setCurrentPage(response.data.current_page);
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
    
    const handleBookRemoval = () => {
        setReadingStatus(undefined);
    }

    return (
        <div>
            <Modal show={openModalReading} onClose={() => setOpenModalReading(false)}>
                <ModalHeader className="border-gray-200">{t("book.add_to_reading", {book_title: props.data?.title})}</ModalHeader>
                <ModalBody>
                    <UpdateReadingStatusView title={props.data?.title} totalPages={totalPages} 
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </ModalBody>
                <ModalFooter>
                <Button onClick={() => editRead()}>{t("forms.save")}</Button>
                <Button color="alternative" onClick={() => setOpenModalReading(false)}>
                    {t("forms.close")}
                </Button>
                </ModalFooter>
            </Modal>

            <ButtonGroup outline>
                {(() => {
                    if (readingStatus === "To be read") {
                        return <Button onClick={() => handleSetReadingCurrentlyReading()}><RiBookOpenLine className="mr-2 h-5 w-5" />{t("reading_status.currently_reading")}</Button>;
                    } else if (readingStatus === "Currently reading") {
                        return <UpdateReadingStatusButton currentPage={currentPage} totalPages={totalPages} id={readID} title={props.data?.title} rating={0} buttonStyle={"alternative"} onSucess={updateReadStatus}/>
                    } else if (readingStatus === "Read") {
                        return <Button disabled><RiBook2Line className="mr-2 h-5 w-5" />{t("reading_status.read")}</Button>;
                    }else {
                        return <Button onClick={() => handleSetReadingToBeRead()}><RiBookmarkLine className="mr-2 h-5 w-5" />{t("reading_status.want_to_read")}</Button>;
                    }
                })()}
        
                <Dropdown>
                    {(() => {
                        if (readingStatus === "To be read") {
                            return <>
                                <DropdownHeader ><span className="block text-sm opacity-50">{t("reading_status.want_to_read")}</span></DropdownHeader>
                                <DropdownDivider />
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead() }>{t("reading_status.read")}</DropdownItem>
                                <DropdownItem onClick={() => setOpenRemoveModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />{t("forms.remove")}</DropdownItem>
                            </>;
                        } else if (readingStatus === "Currently reading") {
                            return <>
                                <DropdownHeader><span className="block text-sm opacity-50">{t("reading_status.currently_reading")}</span></DropdownHeader>
                                <DropdownDivider />
                                <DropdownItem icon={RiBookmarkLine} onClick={() => handleSetReadingToBeRead() }>{t("reading_status.want_to_read")}</DropdownItem>
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead() }>{t("reading_status.read")}</DropdownItem>
                                <DropdownItem onClick={() => setOpenRemoveModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />{t("forms.remove")}</DropdownItem>
                            </>;
                        } else if (readingStatus === "Read") {
                            return <>
                                <DropdownItem icon={RiBookmarkLine} onClick={() => handleSetReadingToBeRead() }>{t("reading_status.want_to_read")}</DropdownItem>
                                <DropdownItem icon={RiBookOpenLine} onClick={() => handleSetReadingCurrentlyReading() }>{t("reading_status.currently_reading")}</DropdownItem>
                                <DropdownItem onClick={() => setOpenRemoveModal(true)}><RiDeleteBin6Line size={18} className="mr-1" />{t("forms.remove")}</DropdownItem>
                            </>;
                        }else {
                            return <>
                                <DropdownItem icon={RiBookOpenLine} onClick={() => handleSetReadingCurrentlyReading()}>{t("reading_status.currently_reading")}</DropdownItem>
                                <DropdownItem icon={RiBook2Line} onClick={() => handleSetReadingRead()}>{t("reading_status.read")}</DropdownItem>
                            </>;
                        }
                    })()}
                    
                </Dropdown>
            </ButtonGroup>
            <RemoveBookModal id={readID} open={openRemoveModal} close={setOpenRemoveModal} onSuccess={handleBookRemoval}/>
        </div>
    )
}

export default AddToReadingListButton