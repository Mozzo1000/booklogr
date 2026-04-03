import { Button, Tooltip } from "flowbite-react";
import { RiShareLine, RiCheckLine } from "react-icons/ri";
import { useState } from 'react';
import useToast from '../toast/useToast';
import { useTranslation } from 'react-i18next';

function ShareProfileButton({ displayName }) {
    const [copied, setCopied] = useState(false);
    const toast = useToast(3000);
    const { t } = useTranslation();

    const shareUrl = `${window.location.origin}/profile/${displayName}`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t("profile.share_title", { name: displayName }),
                    text: t("profile.share_text"),
                    url: shareUrl,
                });
            } catch (err) {
                console.log("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast("success", t("profile.link_copied"));
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                toast("error", "Failed to copy link");
            }
        }
    };

    return (
        <Tooltip content={copied ? t("profile.copied") : t("profile.share_profile")}>
            <Button pill color="light" onClick={handleShare} className="flex items-center justify-center transition-all">
                {copied ? (
                    <RiCheckLine className="h-5 w-5 text-green-500" />
                ) : (
                    <RiShareLine className="h-5 w-5" />
                )}
                <span className="ml-2 hidden sm:inline">{t("profile.share")}</span>
            </Button>
        </Tooltip>
    );
}

export default ShareProfileButton;