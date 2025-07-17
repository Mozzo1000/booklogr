import React, {useState} from 'react'
import { Modal, ModalBody, ModalHeader, Label, Textarea, ToggleSwitch, ModalFooter, Button, TextInput } from 'flowbite-react'
import NotesService from '../services/notes.service';
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';

function EditNoteModal({noteID, content, page, open, visibility, setOpen, onSave}) {
    const [publicSwitch, setPublicSwitch] = useState(visibility == "hidden" ? false : visibility == "public" ? true : false);
    const [noteContent, setNoteContent] = useState(content);
    const [quotePage, setQuotePage] = useState(page);

    const toast = useToast(4000);
    const { t } = useTranslation();

    let noteOrQuote = page ? t("notes.quote") : t("notes.note");

    const save = () => {
        let data = {};

        if(publicSwitch != (visibility == "hidden" ? false : visibility == "public" ? true : false)) {
            if (publicSwitch === true) {
                data.visibility = "public";
            } else if(publicSwitch === false) {
                data.visibility = "hidden";
            }
        }

        if (noteContent != content) {
            data.content = noteContent;
        }

        if (page != quotePage) {
            data.quote_page = quotePage;
        }

        NotesService.edit(noteID, data).then(
            response => {
                toast("success", response.data.message)
                onSave();
                setOpen(false);
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

    return (
        <Modal show={open} size="2xl" onClose={() => setOpen(false)}>
            <ModalHeader className="border-gray-200">{t("notes.edit")} {noteOrQuote.toLowerCase()}</ModalHeader>
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="note_area">{noteOrQuote}</Label>
                        </div>
                        <Textarea id="note_area" required rows={4} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                    </div>
                    {page ? (
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="quote_page">{t("notes.page_number")}</Label>
                            </div>
                            <TextInput type="number" id="quote_page" required value={quotePage} onChange={(e) => setQuotePage(e.target.value)} />
                        </div>
                    ):(
                        <></>
                    )}
                    <ToggleSwitch checked={publicSwitch} onChange={setPublicSwitch} label={t("notes.make_this_public", {type: noteOrQuote.toLowerCase()})} />
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="w-full flex flex-row justify-end gap-4 items-center">
                    <Button color="alternative" onClick={() => setOpen(false)}>{t("forms.cancel")}</Button>
                    <Button onClick={() => save()}>{t("forms.save")}</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default EditNoteModal