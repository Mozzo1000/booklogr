import React, { useState } from 'react'
import { Tabs } from "flowbite-react";
import { RiAccountCircleLine } from "react-icons/ri";
import { RiDatabase2Line } from "react-icons/ri";
import DataTab from '../components/Data/DataTab';

function Settings() {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div className="container mx-auto ">
            <article className="format lg:format-lg pb-2">
                <h2>Settings</h2>
            </article>
            <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} style="underline" className="pt-1">
                <Tabs.Item title="Account" icon={RiAccountCircleLine }></Tabs.Item>
                <Tabs.Item title="Data" icon={RiDatabase2Line }>
                    <DataTab />
                </Tabs.Item>
            </Tabs>
        </div>
    )
}

export default Settings