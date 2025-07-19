import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Popover } from 'flowbite-react';
import { RiErrorWarningLine } from "react-icons/ri";
import { useTranslation, Trans } from 'react-i18next';
import GithubService from '../services/github.service';
import { compare } from 'compare-versions';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom';
import { formatDate } from '../DateFormat';

function CheckUpdate({currentVersion}) {
    const [latestRelease, setLatestRelease] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const { t } = useTranslation();

    const isDataExpired = (timestamp) => {
        return Date.now() - timestamp > CACHE_DURATION;
    }

    useEffect(() => {
        if (localStorage.getItem("update") && !isDataExpired(JSON.parse(localStorage.getItem("update")).timestamp)) {
            const cached_update = JSON.parse(localStorage.getItem("update"))
            setLatestRelease(cached_update.latestRelease)
        } else {
            GithubService.getLatestRelease().then(
                response => {
                    const release = {
                        title: response.data.name || response.data.tag_name,
                        version: response.data.tag_name.replace("v", ""),
                        link: response.data.html_url,
                        release_date: response.data.published_at,
                        content: response.data.body || "",
                    }
                    setLatestRelease(release)
                    localStorage.setItem("update", JSON.stringify({latestRelease: release, timestamp: Date.now()}))
                },
                error => {
                    if (error.response) {
                        console.error("GitHub API error:", error.response.status, error.response.data);
                        if (error.response.status === 404) {
                            console.warn("No release found for repository");
                        }else if (error.response.status == 403) {
                            console.warn("Access forbidden - hitting ratelimit?")
                        }else {
                            console.warn("Unhandled API error: ", error.response.status)
                        }
                    } else if (error.request) {
                        console.error("No response from GitHub API:", error.request);
                    } else {
                        console.error("Unexpected error:", error.message);
                    }
                    setLatestRelease({
                        title: "Unavailable",
                        version: import.meta.env("VITE_APP_VERSION"),
                        link: "#",
                        release_date: "",
                        content: "Could not fetch release info.",
                    })
                }
            )
        }
    }, [])

    const displayPopoverContent = (
        <div className="w-fit text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <p>{t("update.new_version", {version: latestRelease?.version})}</p>
            </div>
        </div>
    )
    

    const isUpdateAvailable = latestRelease && compare(String(latestRelease?.version ? latestRelease.version : 0), currentVersion, ">")

    return (
        <div>
            {isUpdateAvailable &&
            <>
                <Popover content={displayPopoverContent} placement="top" trigger="hover">
                    <Button color="dark" className="rounded-lg p-2.5 text-gray-500 text-xs border-0 hover:bg-none" outline onClick={() => setOpenModal(true)}>
                        <RiErrorWarningLine className="h-5 w-5" />
                    </Button>
                </Popover>

                <Modal show={openModal} dismissible onClose={() => setOpenModal(false)}>
                <ModalHeader className="border-0"><span className="text-2xl">{t("update.release_notes")}</span></ModalHeader>
                <ModalBody>
                    <div className="flex flex-row justify-between format dark:format-invert">
                        <h2>{latestRelease?.title.replace("v", t("update.version") + " ")}</h2>
                        <p>{formatDate(new Date(latestRelease?.release_date))}</p>
                   </div>
                   <div className="format dark:format-invert">
                        <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>
                                {latestRelease?.content}
                        </Markdown>
                    </div>
                </ModalBody>
                <ModalFooter className="flex flex-row justify-end">
                    <Button color="default" as={Link} to={latestRelease?.link} target="_blank">{t("update.go_to_release")}</Button>
                </ModalFooter>
            </Modal>
        </>
        }
        </div>
    )
}

export default CheckUpdate