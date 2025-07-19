import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import useToast from '../toast/useToast';
import { ToggleSwitch } from "flowbite-react";
import LanguageSwitcher from './LanguageSwitcher';
import RegionSwitcher from './RegionSwitcher';
import TimezoneSwitcher from './TimezoneSwitcher';

function InterfaceTab() {
    const [use24Hour, setUse24Hour] = useState(localStorage.getItem("time_format_24h") === "true" ? true : false);
    const toast = useToast(4000);
    const { t } = useTranslation();

    const setTimeFormat = (format) => {
        setUse24Hour(format);
        localStorage.setItem("time_format_24h", format);
        toast("success", t("language.time_format_updated_toast"));
    }

    return (
        <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>{t("language.language")}</h4>
                </div>
                <div className="flex gap-4">
                    <LanguageSwitcher fullSize />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>{t("language.region")}</h4>
                    <p className="text-xs">{t("language.region_info")}</p>
                </div>
                <div className="flex gap-4">
                    <RegionSwitcher />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>{t("language.timezone")}</h4>
                    <p className="text-xs"></p>
                </div>
                <div className="flex gap-4">
                    <TimezoneSwitcher />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>{t("language.time_format")}</h4>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-row gap-4">
                        <p className={ !use24Hour ? "text-blue-600 dark:text-blue-500" : "text-black dark:text-white"}>{t("language.12hour")}</p>
                        <ToggleSwitch checked={use24Hour} onChange={() => setTimeFormat(!use24Hour)}/>
                        <p className={use24Hour ? "text-blue-600 dark:text-blue-500" : "text-black dark:text-white"}>{t("language.24hour")}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InterfaceTab