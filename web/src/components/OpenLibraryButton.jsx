import { isOpenLibraryId } from "../services/bookIdentifiers";
import React from 'react'
import { Spinner, Button, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";

function OpenLibraryButton(props) {
  return (
    <Button className="w-full md:w-fit" as={Link} target="_blank" to={"https://openlibrary.org/" + (isOpenLibraryId(props.identifier) ? "books/" : "isbn/") + props.identifier} color="light">
        <HiOutlineBuildingLibrary className="w-5 h-5 mr-2" />
        Open Library
    </Button>
  )
}

export default OpenLibraryButton
