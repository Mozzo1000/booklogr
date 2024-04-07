import React, { useState, useEffect } from 'react'
import { Dropdown } from 'flowbite-react'
import BooksService from '../services/books.service';
import useToast from '../toast/useToast';
import { FaEllipsisVertical } from "react-icons/fa6";

function ChangeBookLibraryButton(props) {
    const [status, setStatus] = useState();
    const toast = useToast(4000);

    const changeStatus = () => {
        BooksService.edit(props.id, {status: status}).then(
            response => {
                toast("success", response.data.message);
            }
        )
    }

    return (
        <Dropdown label="" dismissOnClick={false} renderTrigger={() => <span className="hover:cursor-pointer"><FaEllipsisVertical /></span>}>
            <Dropdown.Header>
                <span className="block text-sm font-medium">Reading status</span>
                <Dropdown.Divider/>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => (setStatus("Currently reading"), changeStatus())}>Currently reading</Dropdown.Item>
            <Dropdown.Item onClick={() => (setStatus("To be read"), changeStatus())}>To be read</Dropdown.Item>
            <Dropdown.Item onClick={() => (setStatus("Read"), changeStatus())}>Read</Dropdown.Item>
        </Dropdown>
    )
}

export default ChangeBookLibraryButton