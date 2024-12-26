import React, { useState, useEffect } from 'react'
import { Table, Button } from "flowbite-react";
import FilesService from '../../services/files.service';
import useToast from '../../toast/useToast';

function FileList() {
    const [files, setFiles] = useState();
    const toast = useToast(4000);

    useEffect(() => {
        FilesService.getAll().then(
            response => {
                setFiles(response.data);
            },
            error => {
                if (error.response.status != 404) {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    console.log(error)
                    toast("error", resMessage);
                }
            }
        )
    }, [])
    
    const downloadFile = (filename) => {
        FilesService.get(filename).then(
            response => {
                // create file link in browser's memory
                const href = URL.createObjectURL(response.data);

                // create "a" HTML element with href to file & click
                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('download', filename); //or any other extension
                document.body.appendChild(link);
                link.click();

                // clean up "a" element & remove ObjectURL
                document.body.removeChild(link);
                URL.revokeObjectURL(href);
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
        <div>
            <h2 className="format lg:format-lg">Available exports</h2>
            <Table>
                <Table.Head>
                    <Table.HeadCell>Filename</Table.HeadCell>
                    <Table.HeadCell>Created</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {files?.map((item) => {
                        return (
                            <Table.Row key={item.id}>
                                <Table.Cell>{item.filename}</Table.Cell>
                                <Table.Cell>{new Date(item.created_at).toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false})}</Table.Cell>
                                
                                <Table.Cell><Button onClick={() => downloadFile(item.filename)}>Download</Button></Table.Cell>
                            </Table.Row>
                        )
                    })
                    
                }
                </Table.Body>
            </Table>
        </div>
    )
}

export default FileList