import { Button, TabItem, Tabs, Modal, ModalHeader, ModalBody, ModalFooter  } from 'flowbite-react'
import { useEffect, useState } from 'react'
import BooksService from '../services/books.service';
import { RiStickyNoteLine } from "react-icons/ri";
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';
import NotesItem from './NotesItem';
import { RiDoubleQuotesR } from "react-icons/ri";
import { RiBookShelfLine } from "react-icons/ri";
import AddNoteModal from './AddNoteModal';
import AddQuoteModal from './AddQuoteModal';

function NotesView({id, allowEditing, open, setOpen, overrideNotes}) {
    const [notes, setNotes] = useState();

    const [openAddNote, setOpenAddNote] = useState(false);
    const [openAddQuote, setOpenAddQuote] = useState(false);

    const toast = useToast(4000);
    const { t } = useTranslation();

    function getNotes() {
        if (overrideNotes) {
            setNotes(overrideNotes);
        }else {
            BooksService.notes(id).then(
                response => {
                    setNotes(response.data)
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
        if(open) {
            getNotes()
        }
    }, [open])
    
    return (
        <>
        <Modal size={"5xl"} position={"top-center"} show={open} onClose={() => setOpen(false)}>
        <ModalHeader className="border-gray-200">{t("notes.title")}</ModalHeader>
            <ModalBody>
                <Tabs variant="fullWidth" className="sticky">
                    <TabItem active title={t("reading_status.all")} icon={RiBookShelfLine}>
                        <div className="flex flex-col gap-4">
                            {notes?.map((item) => (
                                item?.id &&
                                    <div key={item.id}>
                                        <NotesItem id={item.id} page={item.quote_page ? item.quote_page : 0} date={item.created_on + "Z"} content={item.content}
                                            visibility={item.visibility} allowEditing={allowEditing} onDelete={() =>  getNotes()} onEdit={() =>  getNotes()} />
                                    </div>
                            ))}
                            {notes?.length <= 0 &&
                                <div className="col-span-3">
                                    <div className="grid grid-cols-1 grid-rows-3 place-items-center justify-center items-center text-center">
                                        <RiBookShelfLine size={96} className="dark:text-white"/>
                                        <div className="format lg:format-lg dark:format-invert">
                                            <h2>{t("notes.no_both_error.title")}</h2>
                                            <p>{t("notes.no_both_error.description")}</p>
                                        </div>
                                        <div className="inline-flex gap-4">
                                            <Button onClick={() => setOpenAddNote(true)}>{t("notes.add_note")}</Button>
                                            <Button onClick={() => setOpenAddQuote(true)}>{t("notes.add_quote")}</Button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </TabItem>
                    <TabItem title={t("notes.notes")} icon={RiStickyNoteLine}>
                        <div className="flex flex-col gap-4">
                            {notes?.length > 0 && notes?.filter((item) => !item?.quote_page).map((item) => (
                                item?.id &&
                                    <div key={item.id}>
                                        <NotesItem id={item.id} date={item.created_on + "Z"} content={item.content}
                                            visibility={item.visibility} allowEditing={allowEditing} onDelete={() =>  getNotes()} onEdit={() =>  getNotes()}/>
                                    </div>
                            ))}

                            {notes?.length <= 0 &&
                                <div className="col-span-3">
                                    <div className="grid grid-cols-1 grid-rows-3 place-items-center justify-center items-center text-center">
                                        <RiDoubleQuotesR size={96} className="dark:text-white"/>
                                        <div className="format lg:format-lg dark:format-invert">
                                            <h2>{t("notes.no_notes_error.title")}</h2>
                                            <p>{t("notes.no_notes_error.description")}</p>
                                        </div>
                                        <div className="inline-flex gap-4">
                                            <Button onClick={() => setOpenAddNote(true)}>{t("notes.add_note")}</Button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </TabItem>
                    <TabItem active title={t("notes.quotes")} icon={RiDoubleQuotesR}>
                        <div className="flex flex-col gap-4">
                            {notes?.length > 0 && notes?.filter((item) => item != null && item.quote_page).map((item) => (
                                item?.id &&
                                    <div key={item.id}>
                                        <NotesItem id={item.id} page={item.quote_page ? item.quote_page : 0} date={item.created_on + "Z"} content={item.content} 
                                            visibility={item.visibility} allowEditing={allowEditing} onDelete={() =>  getNotes()} onEdit={() =>  getNotes()}/>
                                    </div>
                            ))}
                            {notes?.length <= 0 &&
                                <div className="col-span-3">
                                    <div className="grid grid-cols-1 grid-rows-3 place-items-center justify-center items-center text-center">
                                        <RiDoubleQuotesR size={96} className="dark:text-white"/>
                                        <div className="format lg:format-lg dark:format-invert">
                                            <h2>{t("notes.no_quotes_error.title")}</h2>
                                            <p>{t("notes.no_quotes_error.description")}</p>
                                        </div>
                                        <div className="inline-flex gap-4">
                                            <Button onClick={() => setOpenAddQuote(true)}>{t("notes.add_quote")}</Button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </TabItem>
                </Tabs>               
            </ModalBody>
            {allowEditing &&
                <ModalFooter>
                    <div className="w-full flex flex-row justify-end gap-4 items-center">
                        <Button color="light" onClick={() => setOpenAddNote(true)}>{t("notes.add_note")}</Button>
                        <Button color="light" onClick={() => setOpenAddQuote(true)}>{t("notes.add_quote")}</Button>
                    </div>
                </ModalFooter>
            }
        </Modal>
        
        <AddNoteModal bookID={id} open={openAddNote} setOpen={setOpenAddNote} onSave={() =>  getNotes()}/>
        <AddQuoteModal bookID={id} open={openAddQuote} setOpen={setOpenAddQuote} onSave={() =>  getNotes()}/>
        </>
    )
}

export default NotesView