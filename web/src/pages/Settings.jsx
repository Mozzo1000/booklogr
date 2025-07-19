import React, { useState } from 'react'
import { Tabs, TabItem} from "flowbite-react";
import { RiAccountCircleLine } from "react-icons/ri";
import { RiDatabase2Line } from "react-icons/ri";
import DataTab from '../components/Data/DataTab';
import AccountTab from '../components/AccountTab';
import AnimatedLayout from '../AnimatedLayout';
import MastodonTab from '../components/MastodonTab';
import { RiMastodonLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';
import { RiSlideshowView } from "react-icons/ri";
import InterfaceTab from '../components/InterfaceTab';

function Settings() {
    const [activeTab, setActiveTab] = useState(0);
    const { t } = useTranslation();
    
    return (
        <AnimatedLayout>
        <div className="container mx-auto ">
            <article className="format lg:format-lg pb-2 dark:format-invert">
                <h2>{t("navigation.settings")}</h2>
            </article>
            <Tabs aria-label="Tabs with underline"  onActiveTabChange={(tab) => setActiveTab(tab)} variant="underline" className="pt-1">
                <TabItem title={t("settings.nav.account")} icon={RiAccountCircleLine }>
                    <AccountTab />
                </TabItem>
                <TabItem title="Interface" icon={RiSlideshowView}>
                    <InterfaceTab />
                </TabItem>
                <TabItem title={t("settings.nav.mastodon")} icon={RiMastodonLine}>
                    <MastodonTab />
                </TabItem>
                <TabItem title={t("settings.nav.data")} icon={RiDatabase2Line }>
                    <DataTab />
                </TabItem>
            </Tabs>
        </div>
        </AnimatedLayout>
    )
}

export default Settings