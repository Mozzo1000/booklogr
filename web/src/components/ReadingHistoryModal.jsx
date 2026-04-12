import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useTranslation } from 'react-i18next';
import BooksService from '../services/books.service';
import { useState, useEffect } from 'react';
import useToast from '../toast/useToast';

function ReadingHistoryModal({bookID, show, onClose}) {
    const [history, setHistory] = useState();
    const { t } = useTranslation();
    const toast = useToast(4000);

    useEffect(() => {
      BooksService.getReadingSessions(bookID).then(
        response => {
          console.log(response.data)
          setHistory(response.data);
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
    }, [show])
    
    
    return (
        <div>
            <Modal size="3xl" show={show} onClose={onClose}>
                <ModalHeader className="border-gray-200">Reading history</ModalHeader>
                <ModalBody>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Status</TableHeadCell>
                                <TableHeadCell>Start date</TableHeadCell>
                                <TableHeadCell>End date</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history?.length > 0 &&
                                history.map((item, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell>{item.status}</TableCell>
                                            <TableCell>{item.start_date}</TableCell>
                                            <TableCell>{item.end_date}</TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </ModalBody>
                <ModalFooter>
                <Button color="alternative" onClick={onClose}>
                    {t("forms.close")}
                </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default ReadingHistoryModal