import {useState} from 'react'
import { Modal, ModalBody, ModalHeader, Label, Textarea, ToggleSwitch, ModalFooter, Button, TextInput } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';

function AddQuoteModal({bookID, open, setOpen, onSave}) {
    const [publicSwitch, setPublicSwitch] = useState(false);
    const [quoteContent, setQuoteContent] = useState();
    const [quotePage, setQuotePage] = useState(0);

    const toast = useToast(4000);
    const { t } = useTranslation();

    const save = () => {
        let data = {}
        data.content = quoteContent;
        data.quote_page = quotePage;

        if(publicSwitch) {
            data.visibility = "public";
        }
        BooksService.addNote(bookID, data).then(
            response => {
                toast("success", response.data.message)
                setQuoteContent();
                onSave();
                setOpen(false);
                setPublicSwitch(false);
                setQuotePage(0);
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
            <ModalHeader className="border-gray-200">{t("notes.add_quote")}</ModalHeader>
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="note_area">{t("notes.quote")}</Label>
                        </div>
                        <Textarea id="note_area" placeholder={t("notes.input_placeholder", {type: "quote"})} required rows={4} value={quoteContent} onChange={(e) => setQuoteContent(e.target.value)} />
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="quote_page">{t("notes.page_number")}</Label>
                        </div>
                        <TextInput type="number" id="quote_page" required value={quotePage} onChange={(e) => setQuotePage(e.target.value)} />
                    </div>
                    <ToggleSwitch checked={publicSwitch} onChange={setPublicSwitch} label={t("notes.make_this_public", {type: "quote"})} />
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="w-full flex flex-row justify-end gap-4 items-center">
                    <Button color="alternative" onClick={() => setOpen(false)}>{t("forms.cancel")}</Button>
                    <Button disabled={!quoteContent} onClick={() => save()}>{t("forms.save")}</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default AddQuoteModal