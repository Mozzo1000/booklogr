import React, { useState, useEffect, useRef }from 'react'
import { Tabs, TabItem, Label, TextInput } from 'flowbite-react'
import { RiPercentLine } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';

function UpdateReadingStatusView({title, currentPage, setCurrentPage, totalPages, onNoProgressError = ()=> {}, onProgressLesserError = ()=> {}, onProgressGreaterError = ()=> {}}) {
    const [percentage, setPercentage] = useState(0);
    const [progressErrorText, setPasswordErrorText] = useState();
    const tabsRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        setPercentage(((currentPage / totalPages) * 100).toFixed(0));
        if (currentPage > totalPages) {
            setPasswordErrorText(t("book.update_reading.error.greater_than"));
            onProgressGreaterError();
        } else if (currentPage < 0) {
            setPasswordErrorText(t("book.update_reading.error.less_than"));
            onProgressLesserError();
        } else {
            setPasswordErrorText();
            onNoProgressError();
        }
    }, [currentPage])

    useEffect(() => {
        if (activeTab == 0) {
            localStorage.setItem("use_percentage_book_read", false)
        }else if (activeTab == 1) {
            localStorage.setItem("use_percentage_book_read", true)
        }
    }, [activeTab])

    return (
        <div className="space-y-6">
            <p className="flex items-center gap-2 dark:text-white">
                <Trans i18nKey="book.update_reading.how_far"
                    components={{
                        book_title: (
                            <p className="font-bold">{title}</p>
                        )
                    }}
                    />
            </p>
            <div className="overflow-x-auto">
                <Tabs variant="fullWidth" ref={tabsRef} onActiveTabChange={(tab) => setActiveTab(tab)}>
                    <TabItem title="Pages" icon={RiBookOpenLine}>
                        <Label className="mb-0 block" htmlFor="input_page">{t("book.update_reading.current_page")}</Label>
                        <TextInput id="input_page" type="number" value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} color={progressErrorText ? 'failure' : 'gray'}/>
                        <p className="pt-2 text-gray-500 text-sm dark:text-gray-400">{t("book.update_reading.progress", {percentage: percentage})}</p>
                    </TabItem>
                    <TabItem active={localStorage.getItem("use_percentage_book_read") === "true"} title={t("book.update_reading.percentage")} icon={RiPercentLine}>
                        <Label className="mb-0 block" htmlFor="input_perc">{t("book.update_reading.percentage_complete")}</Label>
                        <TextInput id="input_perc" type="number" value={percentage} onChange={(e) => setCurrentPage(Math.round((e.target.value / 100) * totalPages))} color={progressErrorText ? 'failure' : 'gray'}/>
                        <p className="pt-2 text-gray-500 text-sm dark:text-gray-400">{t("book.update_reading.current_page_of", {current_page: currentPage, total_pages: totalPages})}</p>
                    </TabItem>
                </Tabs>
                <p className="text-red-600 text-sm">
                    {progressErrorText}
                </p>
            </div>
        </div>
    )
}

export default UpdateReadingStatusView