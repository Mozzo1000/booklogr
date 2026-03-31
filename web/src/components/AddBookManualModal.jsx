import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Button, Select, Label, Textarea, Tooltip, Card, HelperText} from 'flowbite-react';
import useToast from '../toast/useToast';
import BooksService from '../services/books.service';
import { useTranslation } from 'react-i18next';
import { Img } from 'react-image'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useThemeMode } from 'flowbite-react';

function AddBookManualModal(props) {
    const [totalPages, setTotalPages] = useState();
    const [author, setAuthor] = useState();
    const [title, setTitle] = useState();
    const [isbn, setISBN] = useState();
    const [description, setDescription] = useState("");
    const [readingList, setReadingList] = useState("To be read");
    const [errors, setErrors] = useState({ isbn: false, title: false });
    const toast = useToast(4000);
    const theme = useThemeMode();    
    const { t } = useTranslation();
    
    const resetState = () => {
        setTotalPages();
        setAuthor();
        setTitle();
        setISBN();
        setDescription("");
        setReadingList("To be read");
        setErrors({ isbn: false, title: false });
    }

    const handleAddBook = () => {
        const isbnError = !isbn || isbn.trim() === "";
        const titleError = !title || title.trim() === "";

        if (isbnError || titleError) {
            setErrors({ isbn: isbnError, title: titleError });
            return;
        }

        setErrors({ isbn: false, title: false });

        BooksService.add({
                isbn: isbn, 
                title: title, 
                author: author,
                description: description,
                total_pages: totalPages,
                reading_status: readingList}).then(
            response => {
                toast("success", response.data.message);
                props.close(false);
                props.onSuccess();
                resetState();
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
            <Modal dismissible show={props.open} onClose={() => props.close(false)} size='6xl'>
                <ModalHeader className="border-gray-200">{t("actions.add_book")}</ModalHeader>
                <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                        <Card>
                            <h2>Book Cover</h2>
                            <Img width={200} height={200} className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/isbn/" + isbn + "-M.jpg?default=false"} 
                                loader={<Skeleton count={1} width={200} height={200} borderRadius={0} inline={true}/>}
                                unloader={theme.mode == "dark" && <img width={200} src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img width={200} src="/fallback-cover.svg"/>}
                            />
                            <Tooltip content="Currently not implemented">
                                <Button disabled>{t("actions.replace_cover")}</Button>
                            </Tooltip>
                        </Card>
                        <Card>
                            <h2>Book Details</h2>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="isbn">{t("book.isbn")}</Label>
                                </div>
                                <TextInput id="isbn" type="number" placeholder="9781396251634" required value={isbn} onChange={(e) => {setISBN(e.target.value); if (errors.isbn) setErrors({...errors, isbn: false});}} color={errors.isbn ? "failure" : "gray"}/>
                                {errors.isbn && (
                                <HelperText color="failure">
                                    <span className="font-medium">ISBN is required!</span>
                                </HelperText>
                                 )}
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="title">{t("sort.title")}</Label>
                                </div>
                                <TextInput id="title" type="text" required value={title} onChange={(e) => {setTitle(e.target.value); if (errors.title) setErrors({...errors, title: false});}} color={errors.title ? "failure" : "gray"}/>
                                {errors.title && (
                                <HelperText color="failure">
                                    <span className="font-medium">Title is required!</span>
                                </HelperText>
                                )}
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="author">{t("sort.author")}</Label>
                                </div>
                                <TextInput id="author" type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}/>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="description">Description</Label>
                                </div>
                                <Textarea id="description" placeholder="Enter a brief description of the book" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}/>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="num_pages">Number of pages</Label>
                                </div>
                                <TextInput id="num_pages" type="number" placeholder="Enter a total number of pages" required value={totalPages} onChange={(e) => setTotalPages(e.target.value)} />
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="list">Reading list</Label>
                                </div>
                                <Select id="list" require value={readingList} onChange={(e) => setReadingList(e.target.value)}>
                                    <option value="To be read">To be read</option>
                                    <option value="Currently reading">Currently reading</option>
                                    <option value="Read">Read</option>
                                    <option value="Did not finish">Did not finish</option>
                                </Select>
                            </div>
                        </Card>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="w-full flex flex-row gap-2 justify-end">
                        <Button color="gray" onClick={() => props.close(false)}>
                            {t("forms.close")}
                        </Button>
                        <Button onClick={() => handleAddBook()}>{t("forms.save")}</Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default AddBookManualModal