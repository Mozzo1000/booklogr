import React, { useState, useEffect } from 'react'
import { Dropdown } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { FaEllipsisVertical } from "react-icons/fa6";

function ChangeBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const toast = useToast(4000);

    const changeStatus = (statusChangeTo) => {
        console.log(props.id)
        console.log(statusChangeTo)
        BooksService.edit(props.id, {status: statusChangeTo}).then(
            response => {
                toast("success", response.data.message);
                props.onSucess();
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

    const clickDropItem = (stateStatus) => {
        setStatus(stateStatus);
        changeStatus(stateStatus);
    }

    return (
        <Dropdown label="" dismissOnClick={false} renderTrigger={() => <span className="hover:cursor-pointer"><FaEllipsisVertical /></span>}>
            <Dropdown.Header>
                <span className="block text-sm font-medium">Reading status</span>
                <Dropdown.Divider/>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => (clickDropItem("Currently reading"))}>Currently reading</Dropdown.Item>
            <Dropdown.Item onClick={() => (clickDropItem("To be read"))}>To be read</Dropdown.Item>
            <Dropdown.Item onClick={() => (clickDropItem("Read"))}>Read</Dropdown.Item>
        </Dropdown>
    )
}

export default ChangeBookLibraryButton