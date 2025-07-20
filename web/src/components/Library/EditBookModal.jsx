import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Button, Popover, Label, HR} from 'flowbite-react';
import useToast from '../../toast/useToast';
import BooksService from '../../services/books.service';
import { RiQuestionLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';
import { Img } from 'react-image'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useThemeMode } from 'flowbite-react';

function EditBookModal(props) {
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState(props.totalPages);
    const toast = useToast(4000);
    const theme = useThemeMode();    
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

    return (
        <>
            <Modal show={props.open} onClose={() => props.close(false)}>
                <ModalHeader className="border-gray-200">{t("actions.edit_book")}</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="format lg:format-lg dark:format-invert">
                                <h4>{t("sort.title")}</h4>
                            </div>
                            <div className="col-span-2">
                                <TextInput type="text" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="format lg:format-lg dark:format-invert">
                                <h4>{t("sort.author")}</h4>
                            </div>
                            <div className="col-span-2">
                                <TextInput type="text" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="format lg:format-lg dark:format-invert">
                                <h4>{"Cover"}</h4>
                            </div>
                            <div>
                                <Img className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/id/" + 0 + "-M.jpg?default=false"} 
                                    loader={<Skeleton count={1} width={200} height={200} borderRadius={0} inline={true}/>}
                                    unloader={theme.mode == "dark" && <img src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img src="/fallback-cover.svg"/>}
                                />
                                <Button disabled>Replace cover</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="format lg:format-lg dark:format-invert">
                                <h4>{t("book.total_pages")}</h4>
                                <p className="text-xs">{t("help.number_of_pages_information")}</p>
                            </div>
                            <div className="col-span-2 ">
                                <TextInput type="number" value={totalPages} onChange={(e) => setTotalPages(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="w-full flex flex-row gap-2 justify-end">
                        <Button color="gray" onClick={() => props.close(false)}>
                            {t("forms.close")}
                        </Button>
                        <Button onClick={() => handleEditBook()}>{t("forms.save")}</Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default EditBookModal