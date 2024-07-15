import React, { useRef, useState } from 'react'
import { Modal, Rating, Button, RangeSlider, TextInput  } from 'flowbite-react'
import useToast from '../../toast/useToast';
import BooksService from '../../services/books.service';

function BookRating(props) {
    const [openModal, setOpenModal] = useState(false);
    const [rangeValue, setRangeValue] = useState(props.rating ? props.rating : 0);
    const toast = useToast(4000);

    const handleRateBook = () => {
        BooksService.edit(props.id, {rating: rangeValue}).then(
            response => {
                toast("success", response.data.message);
                setOpenModal(false);
                props.onSuccess();
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                setOpenModal(false);
                toast("error", resMessage);
            }
        )
    }

    return (
        <>
        <Rating size={props.size} onClick={() => setOpenModal(true)} className="hover:bg-gray-100 hover:cursor-pointer w-fit">
            <Rating.Star filled={Math.floor(props.rating) >= 1 ? true : false} />
            <Rating.Star filled={Math.floor(props.rating) >= 2 ? true : false} />
            <Rating.Star filled={Math.floor(props.rating) >= 3 ? true : false} />
            <Rating.Star filled={Math.floor(props.rating) >= 4 ? true : false} />
            <Rating.Star filled={Math.floor(props.rating) >= 5 ? true : false} />
            <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{props.rating}</p>
        </Rating>
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Rate book</Modal.Header>
            <Modal.Body>
                <p>How many stars would you like to give <strong>{props.title}</strong>?</p>
                <div className="flex flex-row items-center gap-4">
                    <div className="basis-10/12">
                    <   RangeSlider min={0} max={5} step={0.5} value={rangeValue} onChange={(e) => setRangeValue(e.target.value)}/>
                    </div>
                    <div className="basis-2/12">
                        <TextInput type="number" min={0} max={5} step={0.5} value={rangeValue} onChange={(e) => setRangeValue(e.target.value)}/>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
            <Button onClick={() => handleRateBook()}>Save</Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
                Close
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

BookRating.defaultProps = {
    size: "sm",
}

export default BookRating