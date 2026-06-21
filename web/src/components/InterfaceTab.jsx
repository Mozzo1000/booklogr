import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import useToast from '../toast/useToast';
import { ToggleSwitch, Select, Button, Badge } from "flowbite-react";
import LanguageSwitcher from './LanguageSwitcher';
import RegionSwitcher from './RegionSwitcher';
import TimezoneSwitcher from './TimezoneSwitcher';
import ThemeToggle from './ThemeToggle';
import { RiBook2Line, RiBookOpenLine, RiBookmarkLine, RiCheckLine, RiArchiveLine } from "react-icons/ri";

function InterfaceTab() {
    const [use24Hour, setUse24Hour] = useState(localStorage.getItem("time_format_24h") === "true" ? true : false);
    const toast = useToast(4000);
    const { t } = useTranslation();

    const [defaultView, setDefaultView] = useState(localStorage.getItem("library_default_view") || "Currently reading");
    const [visibleTabs, setVisibleTabs] = useState(() => {
        const saved = localStorage.getItem("library_visible_tabs");
        return saved ? JSON.parse(saved) : {
            all: false,
            currentlyReading: true,
            completed: true,
            toBeRead: true,
            didNotFinish: true
        };
    });

    const handleToggleTab = (tabKey) => {
        setVisibleTabs(prev => {
            const next = { ...prev, [tabKey]: !prev[tabKey] };
            localStorage.setItem("library_visible_tabs", JSON.stringify(next));
            return next;
        });
    };

    const handleDefaultViewChange = (value) => {
        setDefaultView(value);
        localStorage.setItem("library_default_view", value);
    };

    const handleResetNavigation = () => {
        const defaults = {
            all: false,
            currentlyReading: true,
            completed: true,
            toBeRead: true,
            didNotFinish: true
        };
        setDefaultView("Currently reading");
        setVisibleTabs(defaults);
        localStorage.setItem("library_default_view", "Currently reading");
        localStorage.setItem("library_visible_tabs", JSON.stringify(defaults));
    };

    const setTimeFormat = (format) => {
        setUse24Hour(format);
        localStorage.setItem("time_format_24h", format);
        toast("success", t("language.time_format_updated_toast"));
    }

    return (
        <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="format lg:format-lg dark:format-invert ">
                    <h4>{t("settings.theme.theme")}</h4>
                </div>
                <div className="col-span-2">
                    <ThemeToggle />
                </div>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-8 border-gray-200 dark:border-gray-700">
                <div className="format lg:format-lg dark:format-invert">
                    <h4>Library Tab Customization</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose which tabs appear in your library and which is the default.</p>
                </div>

                <div className="col-span-2 flex flex-col gap-6 max-w-md">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="startup-view" className="text-sm font-medium text-gray-900 dark:text-white">
                            Open library to
                        </label>
                        <Select
                            id="startup-view"
                            value={defaultView}
                            onChange={(e) => handleDefaultViewChange(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Currently reading">Currently reading</option>
                            <option value="To be read">To be read</option>
                            <option value="Read">Read</option>
                            <option value="Did not finish">Did not finish</option>
                        </Select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The first tab shown when you open your library.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Visible tabs</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {Object.values(visibleTabs).filter(Boolean).length} of {Object.keys(visibleTabs).length} shown
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                            {[
                                { key: "all", icon: RiBook2Line, label: "All", description: "Everything in your library", value: "All" },
                                { key: "currentlyReading", icon: RiBookOpenLine, label: "Currently Reading", description: "Books you are reading now", value: "Currently reading" },
                                { key: "toBeRead", icon: RiBookmarkLine, label: "To be read", description: "Books you want to read", value: "To be read" },
                                { key: "completed", icon: RiBook2Line, label: "Completed", description: "Books you have finished reading", value: "Read" },
                                { key: "didNotFinish", icon: RiArchiveLine, label: "Did Not Finish", description: "Books you did not / want not to finish reading", value: "Did not finish" },
                            ].map(({ key, icon: Icon, label, description, value }) => (
                                <div key={key} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 first:rounded-t-lg last:rounded-b-lg">
                                    <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                                            {defaultView === value && (
                                                <Badge color="info" size="xs">Default</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={visibleTabs[key]}
                                        onChange={() => handleToggleTab(key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button color="gray" onClick={handleResetNavigation}>
                            Reset Defaults
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InterfaceTab