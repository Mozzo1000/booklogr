import React, { useState } from "react";
import AddBookManualModal from "./AddBookManualModal";
import { Button, Tooltip } from "flowbite-react";
import { RiAddBoxLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';

function AddBookButton(props) {
    const [openAddBookManualModal, setOpenAddBookManulModal] = useState();
    const { t } = useTranslation();

    return (
        <>
        <Tooltip content={t("actions.add_book")}>
            {props.collapseButton ? (
            <Button color="alternative" onClick={() => setOpenAddBookManulModal(true)}><RiAddBoxLine className="w-6 h-6 text-gray-500"/></Button>
            ):(
                <Button color="alternative" onClick={() => setOpenAddBookManulModal(true)}><RiAddBoxLine className="w-6 h-6 mr-1 text-gray-500"/>Add book</Button>
            )}
        </Tooltip>
        <AddBookManualModal open={openAddBookManualModal} close={setOpenAddBookManulModal} onSuccess={props.onSuccess} />
        </>
    )
}

export default AddBookButton