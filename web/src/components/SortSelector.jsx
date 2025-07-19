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
        localStorage.setItem("last_sorted", JSON.stringify(item));
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
            <p>{t("sort.sort_by", {sortType: sort.name ? sort.name.toLowerCase() : t("sort.title").toLowerCase()})}</p>
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
            <DropdownItem onClick={() => handleSort({value: "title", name: t("sort.title")})}>{t("sort.title")}</DropdownItem>
            <DropdownItem onClick={() => handleSort({value: "author", name: t("sort.author")})}>{t("sort.author")}</DropdownItem>
            <DropdownItem onClick={() => handleSort({value: "progress", name: t("sort.progress")})}>{t("sort.progress")}</DropdownItem>
            <DropdownItem onClick={() => handleSort({value: "rating", name: t("sort.rating")})}>{t("sort.rating")}</DropdownItem>
            <DropdownItem onClick={() => handleSort({value: "created_on", name: t("sort.date_added")})}>{t("sort.date_added")}</DropdownItem>
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