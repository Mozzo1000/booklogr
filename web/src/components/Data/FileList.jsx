import React, { useState, useEffect, useRef } from 'react'
import { Table, TableHead, TableHeadCell, TableBody, TableCell, TableRow, Button, Spinner} from "flowbite-react";
import FilesService from '../../services/files.service';
import TasksService from '../../services/tasks.service';
import { createExportPoller } from './exportPolling';
import useToast from '../../toast/useToast';
import { useInterval } from '../../useInterval';
import { useTranslation, Trans } from 'react-i18next';
import { formatDateTime } from '../../DateFormat';

function FileList(props) {
    const [files, setFiles] = useState();
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [loading, setLoading] = useState(false);
    const poller = useRef(null);
    const toast = useToast(4000);
    const { t } = useTranslation();

    useEffect(() => {
        if (props.refresh) {
            const finish = () => {
                props.refreshComplete();
                setRefreshInterval(null);
                setLoading(false);
            };
            const requestPoller = createExportPoller({
                getTask: () => TasksService.get(props.taskId),
                getFiles: () => FilesService.getAll(),
                onFiles: setFiles,
                onSuccess: () => {
                    toast("success", t("toast.file_available_download"));
                    finish();
                },
                onFailure: message => {
                    toast("error", message);
                    finish();
                },
            });
            poller.current = requestPoller;
            setLoading(true);
            setRefreshInterval(2000);
            return () => requestPoller.stop();
        }
        setLoading(false);
        setRefreshInterval(null);
    }, [props.refresh, props.taskId])

    useEffect(() => {
        FilesService.getAll().then(
            response => setFiles(response.data),
            error => {
                if (error.response?.status !== 404) {
                    toast("error", error.response?.data?.message || error.message || error.toString());
                }
            }
        );
    }, [])

    useInterval(() => {
        poller.current?.poll();
    }, refreshInterval)

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
            <div className="flex flex-row gap-4">
            <h2 className="format lg:format-lg dark:format-invert">{t("settings.data.files.available_exports")} ({files?.length || 0})</h2>
                {loading &&
                    <Spinner />
                }
            </div>
            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>{t("settings.data.files.filename")}</TableHeadCell>
                        <TableHeadCell>{t("settings.data.files.created")}</TableHeadCell>
                        <TableHeadCell>{t("settings.data.files.action")}</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files?.map((item) => {
                        return (
                            <TableRow key={item.id}>
                                <TableCell>{item.filename}</TableCell>
                                <TableCell>{formatDateTime(new Date(item.created_at + "Z"))}</TableCell>
                                <TableCell><Button onClick={() => downloadFile(item.filename)}>{t("forms.download")}</Button></TableCell>
                            </TableRow>
                        )
                    })
                    
                }
                </TableBody>
            </Table>
        </div>
    )
}

export default FileList