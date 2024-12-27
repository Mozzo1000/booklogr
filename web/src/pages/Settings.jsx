import React, { useState } from 'react'
import { Tabs } from "flowbite-react";
import { RiAccountCircleLine } from "react-icons/ri";
import { RiDatabase2Line } from "react-icons/ri";
import DataTab from '../components/Data/DataTab';
import AccountTab from '../components/AccountTab';
import AnimatedLayout from '../AnimatedLayout';
import MastodonTab from '../components/MastodonTab';
import { RiMastodonLine } from "react-icons/ri";

function Settings() {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <AnimatedLayout>
        <div className="container mx-auto ">
            <article className="format lg:format-lg pb-2">
                <h2>Settings</h2>
            </article>
            <Tabs onActiveTabChange={(tab) => setActiveTab(tab)} variant="underline" className="pt-1">
                <Tabs.Item title="Account" icon={RiAccountCircleLine }>
                    <AccountTab />
                </Tabs.Item>
                <Tabs.Item title="Mastodon" icon={RiMastodonLine}>
                    <MastodonTab />
                </Tabs.Item>
                <Tabs.Item title="Data" icon={RiDatabase2Line }>
                    <DataTab />
                </Tabs.Item>
            </Tabs>
        </div>
        </AnimatedLayout>
    )
}

export default Settings