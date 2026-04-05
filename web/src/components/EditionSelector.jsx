import React, { useEffect, useState } from 'react'
import OpenlibraryService from '../services/openlibrary.service';
import useToast from '../toast/useToast';
import { Button, ButtonGroup, Dropdown, DropdownHeader, DropdownItem, Modal, ModalBody, ModalHeader, Label } from 'flowbite-react';
import { RiBook2Line } from "react-icons/ri";
import { Link } from 'react-router-dom';
import EditionItem from './EditionItem';
import { RiExternalLinkLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';
import { RiCheckLine } from "react-icons/ri";

function EditionSelector({work_id, selected_isbn}) {
    const [editionList, setEditionList] = useState();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const toast = useToast(4000);
    const { t } = useTranslation();

    useEffect(() => {
        if (work_id) {
            OpenlibraryService.getEditions(work_id, 100).then(
                response => {
                    setEditionList(response.data.entries)
                    console.log(response.data.entries)
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    toast("error", "OpenLibrary: " + resMessage);
                }
            )
        }
    }, [work_id])

    const languages = Array.from(
        new Set(
            editionList?.flatMap(entry => {
            if (!entry.languages || entry.languages.length === 0) {
                return ["unknown"];
            }
            return entry.languages.map(l => l.key.split("/").pop());
            })
        )
    );
    const filteredEntries = selectedLanguage
    ? editionList?.filter(entry => {
        if (!entry.languages || entry.languages.length === 0) {
            return selectedLanguage === "unknown";
        }
        return entry.languages.some(
            lang => lang.key === `/languages/${selectedLanguage}`
        );
        })
    : editionList;

    function LanguageSelector() {
        return (
            <div className="flex gap-2 items-center">
                <Label className="flex" htmlFor="language">Filter by language</Label>
                <Dropdown id="language" label={selectedLanguage ? selectedLanguage.toUpperCase() : "All languages"} outline>
                    <div className="overflow-auto h-36">
                        <DropdownItem onClick={() => setSelectedLanguage("")}>All languages</DropdownItem>
                        {languages.map(lang => (
                            <DropdownItem key={lang} value={lang} onClick={() => setSelectedLanguage(lang)} className={selectedLanguage == lang ? "bg-blue-600 text-white hover:text-black": ""}>
                                {lang.toUpperCase()}
                            </DropdownItem>
                        ))}
                    </div>
                </Dropdown>
            </div>
        )
    }

    return (
        <>
        <Dropdown disabled={!work_id} className="w-full md:w-fit" dismissOnClick={true} label={<span className="inline-flex items-center gap-2"><RiBook2Line className="w-4 h-4" />{t("editions.change")}</span>} color={"light"}>
            <DropdownHeader>
                <div className="flex flex-row justify-between items-center">
                    <p className="text-xl">{t("editions.title")} ({filteredEntries?.length || 0})</p>
                    <Button color="light" onClick={()=>setOpenModal(true)}>
                        <RiExternalLinkLine className="h-6 w-6" />
                    </Button>
                </div>
            </DropdownHeader>
            <LanguageSelector />

            <div className="max-h-96 overflow-y-auto">
                {filteredEntries?.map(function(data) {
                    return (
                        data.isbn_13?.[0] && (
                            <DropdownItem as={Link} to={"/books/" + data.isbn_13[0]} >
                                <EditionItem data={data} selected_isbn={selected_isbn}/>
                            </DropdownItem>
                        )
                        
                    )
                })}
            </div>
        </Dropdown>

        <Modal show={openModal} dismissible onClose={() => setOpenModal(false)}>
            <ModalHeader className="border-0"><span className="text-2xl">{t("editions.title")} ({filteredEntries?.length || 0})</span></ModalHeader>
            <ModalBody>
                <div className="flex flex-col gap-4">
                <LanguageSelector />
                {filteredEntries?.map(function(data) {
                    return (
                        data.isbn_13?.[0] && (
                            <Link to={"/books/" + data.isbn_13[0]} className="contents">
                                <div className="flex w-full hover:bg-gray-100">
                                    <EditionItem data={data} selected_isbn={selected_isbn} />
                                </div>
                            </Link>
                        )
                    )
                })}
                </div>
            </ModalBody>
        </Modal>
        </>
  )
}

export default EditionSelector