import React, { useState, useEffect, useRef }from 'react'
import { Tabs, TabItem, Label, TextInput } from 'flowbite-react'
import { RiPercentLine } from "react-icons/ri";
import { RiBookOpenLine } from "react-icons/ri";

function UpdateReadingStatusView(props) {
    const [percentage, setPercentage] = useState(0);
    const [progressErrorText, setPasswordErrorText] = useState();
    const tabsRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        setPercentage(((props.updatedProgress / props.totalPages) * 100).toFixed(0));
        if (props.updatedProgress > props.totalPages) {
            setPasswordErrorText("Current page cannot be greater than total pages.");
            props.onProgressGreaterError();
        } else if (props.updatedProgress < 0) {
            setPasswordErrorText("Current page cannot be less than 0.");
            props.onProgressLesserError();
        } else {
            setPasswordErrorText();
            props.onNoProgressError();
        }
    }, [props.updatedProgress])

    useEffect(() => {
        if (activeTab == 0) {
            localStorage.setItem("use_percentage_book_read", false)
        }else if (activeTab == 1) {
            localStorage.setItem("use_percentage_book_read", true)
        }
    }, [activeTab])

    return (
        <div className="space-y-6">
            <p className="flex items-center gap-2">How far are you in<p className="font-bold">{props.title}</p> ?</p>
            <div className="overflow-x-auto">
                <Tabs variant="fullWidth" ref={tabsRef} onActiveTabChange={(tab) => setActiveTab(tab)}>
                    <TabItem title="Pages" icon={RiBookOpenLine}>
                        <Label className="mb-0 block" htmlFor="input_page">Current page</Label>
                        <TextInput id="input_page" type="number" value={props.updatedProgress} onChange={(e) => props.setUpdatedProgress(e.target.value)} color={progressErrorText ? 'failure' : 'gray'}/>
                        <p className="pt-2 text-gray-500 text-sm">Progress: {percentage}%</p>
                    </TabItem>
                    <TabItem active={localStorage.getItem("use_percentage_book_read") === "true"} title="Percentage" icon={RiPercentLine}>
                        <Label className="mb-0 block" htmlFor="input_perc">Percentage complete</Label>
                        <TextInput id="input_perc" type="number" value={percentage} onChange={(e) => props.setUpdatedProgress(Math.round((e.target.value / 100) * props.totalPages))} color={progressErrorText ? 'failure' : 'gray'}/>
                        <p className="pt-2 text-gray-500 text-sm">Current page: {props.updatedProgress} of {props.totalPages}</p>
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