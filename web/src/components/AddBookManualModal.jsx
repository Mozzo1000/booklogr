import { coverUrl } from "../services/bookIdentifiers";
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { TextInput, Button, Select, Label, Textarea, Tooltip, Card, HelperText} from 'flowbite-react';
import useToast from '../toast/useToast';
import BooksService from '../services/books.service';
import FieldsService from '../services/fields.service';
import FieldInputs from './FieldInputs';
import { useTranslation } from 'react-i18next';
import { Img } from 'react-image'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useThemeMode } from 'flowbite-react';
import AdaptiveDialog from './AdaptiveDialog';

function AddBookManualModal(props) {
    const [totalPages, setTotalPages] = useState();
    const [author, setAuthor] = useState();
    const [title, setTitle] = useState();
    const [subtitle, setSubtitle] = useState();
    const [isbn, setISBN] = useState("");
    const [identifierType, setIdentifierType] = useState("isbn");
    const [description, setDescription] = useState("");
    const [readingList, setReadingList] = useState("To be read");
    const [errors, setErrors] = useState({ isbn: false, title: false });
    const [fields, setFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});
    const toast = useToast(4000);
    const queryClient = useQueryClient();
    const theme = useThemeMode();
    const { t } = useTranslation();

    useEffect(() => {
        if (!props.open) return;
        FieldsService.get().then(
            response => setFields(response.data)
        );
    }, [props.open]);

    const handleFieldChange = (fieldId, value) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const resetState = () => {
        setTotalPages();
        setAuthor();
        setTitle();
        setSubtitle();
        setISBN("");
        setIdentifierType("isbn");
        setDescription("");
        setReadingList("To be read");
        setErrors({ isbn: false, title: false });
        setFieldValues({});
    }

    const handleAddBook = () => {
        const isbnError = !isbn || isbn.trim() === "";
        const titleError = !title || title.trim() === "";

        if (isbnError || titleError) {
            setErrors({ isbn: isbnError, title: titleError });
            return;
        }

        setErrors({ isbn: false, title: false });

        var currentPage = 0
        if (readingList == "Read") {
            currentPage = totalPages || 0
        }

        BooksService.add({
                [identifierType]: isbn.trim(),
                title: title,
                subtitle: subtitle,
                author: author,
                description: description,
                current_page: currentPage,
                total_pages: totalPages,
                reading_status: readingList}).then(
            response => {
                const bookId = response.data.id;
                const fieldsToSave = fields.map(f => ({
                    field_id: f.id,
                    value: fieldValues[f.id] || null,
                }));
                const saveFields = bookId && fields.length > 0
                    ? FieldsService.saveBookValues(bookId, fieldsToSave)
                    : Promise.resolve();
                saveFields.then(() => {
                    props.close(false);
                    queryClient.invalidateQueries({ queryKey: ["books"] });
                    queryClient.invalidateQueries({ queryKey: ["search"] });
                    props.onSuccess?.();
                    resetState();
                }).catch(error => toast("error", error.response?.data?.message || error.message));
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
            <Button onClick={handleAddBook}>
                {t("forms.save")}
            </Button>
        </div>
    );

    return (
        <>
        <AdaptiveDialog type="modal" show={props.open} onClose={() => props.close(false)} title={t("actions.add_book")} footer={modalFooter} size="6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                <div className="flex flex-col gap-2">
                <Card>
                    <h2>{t("book.book_cover")}</h2>
                    <Img crossorigin="anonymous" width={200} height={200} className="shadow-2xl object-fit rounded" src={coverUrl(isbn)}
                        loader={<Skeleton count={1} width={200} height={200} borderRadius={0} inline={true}/>}
                        unloader={theme.computedMode == "dark" && <img width={200} src="/fallback-cover-light.svg"/> || theme.computedMode == "light" && <img width={200} src="/fallback-cover.svg"/>}
                    />
                    <Tooltip content={t("book.not_implemented")}>
                        <Button disabled>{t("actions.replace_cover")}</Button>
                    </Tooltip>
                </Card>
                {fields.length > 0 && (
                    <Card>
                        <h2>Fields</h2>
                        <FieldInputs fields={fields} values={fieldValues} onChange={handleFieldChange}
                        />
                    </Card>
                )}
                </div>
                <Card>
                    <h2>{t("book.details")}</h2>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="identifier-type">{t("book.identifier_type", "Identifier type")}</Label>
                            <Select id="identifier-type" value={identifierType} onChange={(e) => { setIdentifierType(e.target.value); setISBN(""); }}>
                                <option value="isbn">ISBN</option>
                                <option value="openlibrary_id">Open Library edition ID</option>
                            </Select>
                            <Label htmlFor="isbn">{identifierType === "isbn" ? "ISBN" : "Open Library edition ID"}</Label>
                        </div>
                        <TextInput id="isbn" type="text" placeholder={identifierType === "isbn" ? "9781396251634" : "OL62524517M"} required value={isbn} onChange={(e) => {setISBN(e.target.value); if (errors.isbn) setErrors({...errors, isbn: false});}} color={errors.isbn ? "failure" : "gray"}/>
                        {errors.isbn && (
                        <HelperText color="failure">
                            <span className="font-medium">{t("forms.identifier_required", "A book identifier is required")}</span>
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
                            <span className="font-medium">{t("forms.title_required")}</span>
                        </HelperText>
                        )}
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="subtitle">{t("book.subtitle")}</Label>
                        </div>
                        <TextInput id="subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="author">{t("sort.author")}</Label>
                        </div>
                        <TextInput id="author" type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}/>
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
                        <TextInput id="num_pages" type="number" placeholder={t("forms.placeholder_total_num_pages")} required value={totalPages} onChange={(e) => e.target.value ? setTotalPages(parseInt(e.target.value)) : setTotalPages(undefined)} />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="list">{t("reading_status.list")}</Label>
                        </div>
                        <Select id="list" require value={readingList} onChange={(e) => setReadingList(e.target.value)}>
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

export default AddBookManualModal
