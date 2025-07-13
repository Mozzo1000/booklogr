import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Button, Popover, Label} from 'flowbite-react';
import useToast from '../../toast/useToast';
import BooksService from '../../services/books.service';
import { RiQuestionLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';

function EditBookModal(props) {
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState(props.totalPages);
    const toast = useToast(4000);
    const { t } = useTranslation();
    
    const handleEditBook = () => {
        BooksService.edit(props.id, {total_pages: parseInt(totalPages)}).then(
            response => {
                toast("success", response.data.message);
                props.close(false);
                props.onSuccess();
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                props.close(false);
                toast("error", resMessage);
            }
        )
    }

    const displayPopoverContent = (
        <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("help.title")}</h3>
            </div>
            <div className="px-3 py-2">
                <p>{t("help.number_of_pages_information")}</p>
            </div>
        </div>
    )

    return (
        <>
            <Modal show={props.open} onClose={() => props.close(false)}>
                <ModalHeader className="border-gray-200">{t("actions.edit_book")}</ModalHeader>
                <ModalBody>                        
                    <div>
                        <div className="flex flex-row gap-2 items-center">
                            <Label htmlFor="editTotalPages">{t("book.total_pages")}</Label>
                            <Popover trigger="hover" content={displayPopoverContent}>
                                <span><RiQuestionLine className="dark:text-white"/></span>
                            </Popover>
                        </div>
                        <TextInput id="editTotalPages" type="number" value={totalPages} onChange={(e) => setTotalPages(e.target.value)} />
                    </div>
                </ModalBody>
                <ModalFooter>
                <Button onClick={() => handleEditBook()}>{t("forms.save")}</Button>
                <Button color="gray" onClick={() => props.close(false)}>
                    {t("forms.close")}
                </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default EditBookModal