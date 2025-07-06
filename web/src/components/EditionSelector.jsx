import React, { useEffect, useState } from 'react'
import OpenlibraryService from '../services/openlibrary.service';
import useToast from '../toast/useToast';
import { Button, ButtonGroup, Dropdown, DropdownHeader, DropdownItem, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { RiBook2Line } from "react-icons/ri";
import { Link } from 'react-router-dom';
import EditionItem from './EditionItem';
import { RiExternalLinkLine } from "react-icons/ri";

function EditionSelector({work_id}) {
    const [editionList, setEditionList] = useState();
    const [openModal, setOpenModal] = useState(false);
    const toast = useToast(4000);

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

    return (
        <>
        <Dropdown dismissOnClick={true} label={<span className="inline-flex items-center gap-2"><RiBook2Line className="w-4 h-4" />Change edition</span>} color={"light"}>
            <DropdownHeader>
                <div className="flex flex-row justify-between items-center">
                    <p className="text-xl">Editions ({editionList?.length || 0})</p>
                    <Button color="light" onClick={()=>setOpenModal(true)}>
                        <RiExternalLinkLine className="h-6 w-6" />
                    </Button>
                </div>
            </DropdownHeader>
            <div className="max-h-96 overflow-y-auto">
                {editionList?.map(function(data) {
                    return (
                        data.isbn_13?.[0] && (
                            <DropdownItem as={Link} to={"/books/" + data.isbn_13[0]} >
                                <EditionItem data={data} />
                            </DropdownItem>
                        )
                        
                    )
                })}
            </div>
        </Dropdown>

        <Modal show={openModal} dismissible onClose={() => setOpenModal(false)}>
            <ModalHeader className="border-0"><span className="text-2xl">Editions ({editionList?.length || 0})</span></ModalHeader>
            <ModalBody>
                {editionList?.map(function(data) {
                    return (
                        data.isbn_13?.[0] && (
                            <Link to={"/books/" + data.isbn_13[0]} className="contents">
                                <div className="flex w-full hover:bg-gray-100">
                                    <EditionItem data={data} />
                                </div>
                            </Link>
                        )
                    )
                })}
            </ModalBody>
        </Modal>
        </>
  )
}

export default EditionSelector