import React, { useState } from 'react'
import { TextInput, Button, Select, Label, Textarea, Tooltip, Card } from 'flowbite-react';
import useToast from '../../toast/useToast';
import BooksService from '../../services/books.service';
import { useTranslation } from 'react-i18next';
import { Img } from 'react-image'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useThemeMode } from 'flowbite-react';
import AdaptiveDialog from '../AdaptiveDialog';

function EditBookModal(props) {
    const [totalPages, setTotalPages] = useState(props.totalPages ?? "");
    const [author, setAuthor] = useState(props.author ?? "");
    const [title, setTitle] = useState(props.title ?? "");
    const [isbn] = useState(props.isbn ?? "");
    const [description, setDescription] = useState(props.description ?? "");
    const [readingStatus, setReadingStatus] = useState(props.readingStatus ?? "To be read");
    const toast = useToast(4000);
    const theme = useThemeMode();
    const { t } = useTranslation();

    const handleEditBook = () => {
        BooksService.edit(props.id, {
            total_pages: parseInt(totalPages),
            title: title,
            author: author,
            description: description,
            status: readingStatus,
        }).then(
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

    const modalFooter = (
        <div className="flex gap-2">
            <Button color="gray" onClick={() => props.close(false)}>
                {t("forms.close")}
            </Button>
            <Button onClick={handleEditBook}>
                {t("forms.save")}
            </Button>
        </div>
    );

    return (
        <>
        <AdaptiveDialog type="modal" show={props.open} onClose={() => props.close(false)} title={t("actions.edit_book")} footer={modalFooter} size="6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                <Card>
                    <h2>{t("book.book_cover")}</h2>
                    <Img crossorigin="anonymous" width={200} height={200} className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/isbn/" + isbn + "-M.jpg?default=false"}
                        loader={<Skeleton count={1} width={200} height={200} borderRadius={0} inline={true}/>}
                        unloader={theme.mode == "dark" && <img width={200} src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img width={200} src="/fallback-cover.svg"/>}
                    />
                    <Tooltip content={t("book.not_implemented")}>
                        <Button disabled>{t("actions.replace_cover")}</Button>
                    </Tooltip>
                </Card>
                <Card>
                    <h2>{t("book.details")}</h2>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="isbn">{t("book.isbn")}</Label>
                        </div>
                        <TextInput id="isbn" type="text" value={isbn} disabled/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title">{t("sort.title")}</Label>
                        </div>
                        <TextInput id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="author">{t("sort.author")}</Label>
                        </div>
                        <TextInput id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="description">{t("book.description")}</Label>
                        </div>
                        <Textarea id="description" placeholder={t("forms.placeholder_description")} rows={4} value={description} onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="num_pages">{t("book.num_pages")}</Label>
                        </div>
                        <TextInput id="num_pages" type="number" placeholder={t("forms.placeholder_total_num_pages")} value={totalPages} onChange={(e) => setTotalPages(e.target.value)}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="list">{t("reading_status.list")}</Label>
                        </div>
                        <Select id="list" value={readingStatus} onChange={(e) => setReadingStatus(e.target.value)}>
                            <option value="To be read">{t("reading_status.to_be_read")}</option>
                            <option value="Currently reading">{t("reading_status.currently_reading")}</option>
                            <option value="Read">{t("reading_status.read")}</option>
                            <option value="Did not finish">{t("reading_status.did_not_finish")}</option>
                        </Select>
                    </div>
                </Card>
            </div>
        </AdaptiveDialog>
        </>
    )
}

export default EditBookModal
