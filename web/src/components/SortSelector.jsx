import React, { useState } from 'react'
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Modal, ModalBody, ModalHeader, ModalFooter, Button, Popover } from 'flowbite-react'
import { RiArrowUpDownLine } from "react-icons/ri";
import { RiArrowDownLine } from "react-icons/ri";
import { RiArrowUpLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';

function SortSelector({sort, setSort, order, setOrder}) {
    const { t } = useTranslation();

    const handleSort = (item) => {
        setSort(item);
        localStorage.setItem("last_sorted", item);
    }

    const handleOrder = () => {
        if (order === "asc") {
            setOrder("desc");
            localStorage.setItem("last_ordered", "desc");
        } else {
            setOrder("asc");
            localStorage.setItem("last_ordered", "asc");
        }
    }

    const dropdownLabel = (
        <>
            <RiArrowUpDownLine className="h-4 w-4 mr-1"/>
            <p>{t("sort.sort_by", {sortType: sort})}</p>
        </>
    )

    const displayPopoverContent = (
        <div className="w-fit text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <p>{t("sort.order_by")}</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-row gap-1">
        <Dropdown label={dropdownLabel} color="alternative">
            <DropdownItem onClick={() => handleSort("title")}>{t("sort.title")}</DropdownItem>
            <DropdownItem onClick={() => handleSort("author")}>{t("sort.author")}</DropdownItem>
            <DropdownItem onClick={() => handleSort("progress")}>{t("sort.progress")}</DropdownItem>
            <DropdownItem onClick={() => handleSort("rating")}>{t("sort.rating")}</DropdownItem>
            <DropdownItem onClick={() => handleSort("created_on")}>{t("sort.date_added")}</DropdownItem>
        </Dropdown>
        <Popover content={displayPopoverContent} trigger="hover">
            <Button color="alternative" onClick={() => handleOrder()}>
                {order === "asc" ? (
                    <RiArrowDownLine />
                ): ( 
                    <RiArrowUpLine />
                )}
            </Button>
        </Popover>
        </div>
    )
}

export default SortSelector