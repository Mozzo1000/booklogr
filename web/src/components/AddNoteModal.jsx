import {useState} from 'react'
import { Modal, ModalBody, ModalHeader, Label, Textarea, ToggleSwitch, ModalFooter, Button } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';

function AddNoteModal({bookID, open, setOpen, onSave}) {
    const [publicSwitch, setPublicSwitch] = useState(false);
    const [noteContent, setNoteContent] = useState();

    const toast = useToast(4000);
    const { t } = useTranslation();

    const save = () => {
        let data = {}
        data.content = noteContent;
       
        if(publicSwitch) {
            data.visibility = "public";
        }

        BooksService.addNote(bookID, data).then(
            response => {
                toast("success", response.data.message)
                setNoteContent();
                onSave();
                setOpen(false);
                setPublicSwitch(false);
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
            <ModalHeader className="border-gray-200">{t("notes.add_note")}</ModalHeader>
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="note_area">{t("notes.note")}</Label>
                        </div>
                        <Textarea id="note_area" placeholder={t("notes.input_placeholder", {type: "note"})} required rows={4} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                    </div>
                    <ToggleSwitch checked={publicSwitch} onChange={setPublicSwitch} label={t("notes.make_this_public", {type: "note"})} />
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="w-full flex flex-row justify-end gap-4 items-center">
                    <Button color="alternative" onClick={() => setOpen(false)}>{t("forms.cancel")}</Button>
                    <Button disabled={!noteContent} onClick={() => save()}>{t("forms.save")}</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default AddNoteModal