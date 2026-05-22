import React from 'react'
import { useThemeMode } from 'flowbite-react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Img } from 'react-image'
import { Badge } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

function EditionItem({data, selected_isbn}) {
    const theme = useThemeMode();
    const { t } = useTranslation();
    const isbn = data.isbn_13?.[0];
    const coverId = data.covers?.[0];
    const fallbackCover = theme.mode === "dark" ? "/fallback-cover-light.svg" : "/fallback-cover.svg";
    const coverClassName = "h-full w-full rounded object-contain shadow-2xl";
    
    function extractYear(dateString) {
        if (!dateString) return null; // handle null

        const parsedDate = new Date(dateString);
        
        if (!isNaN(parsedDate)) {
            return parsedDate.getFullYear(); // works for both "Nov 11, 2021" and "2021"
        }

        // fallback: maybe the string is just a year?
        const yearMatch = dateString.match(/^\d{4}$/);
        return yearMatch ? parseInt(yearMatch[0], 10) : null;
    }

    const languageFlags = {
        eng: "🇬🇧", // English - United Kingdom
        spa: "🇪🇸", // Spanish - Spain
        fra: "🇫🇷", // French - France
        deu: "🇩🇪", // German - Germany
        jpn: "🇯🇵", // Japanese - Japan
        rus: "🇷🇺", // Russian - Russia
        ita: "🇮🇹", // Italian - Italy
        swe: "🇸🇪", // Swedish - Sweden
        nld: "🇳🇱", // Dutch - Netherlands
        por: "🇵🇹", // Portuguese - Portugal
        zho: "🇨🇳", // Chinese - China
        ara: "🇸🇦", // Arabic - Saudi Arabia
        hin: "🇮🇳", // Hindi - India
        kor: "🇰🇷", // Korean - South Korea
        heb: "🇮🇱", // Hebrew - Israel
        tha: "🇹🇭", // Thai - Thailand
        tur: "🇹🇷", // Turkish - Turkey
        ukr: "🇺🇦", // Ukrainian - Ukraine
        pol: "🇵🇱", // Polish - Poland
        dan: "🇩🇰", // Danish - Denmark
        fin: "🇫🇮", // Finnish - Finland
        nor: "🇳🇴", // Norwegian - Norway
        ces: "🇨🇿", // Czech - Czech Republic
        hun: "🇭🇺", // Hungarian - Hungary
        ron: "🇷🇴", // Romanian - Romania
        ell: "🇬🇷", // Greek - Greece
        vie: "🇻🇳", // Vietnamese - Vietnam
        ind: "🇮🇩", // Indonesian - Indonesia
        tam: "🇮🇳", // Tamil - India
        ben: "🇧🇩", // Bengali - Bangladesh
    };

    return (
        <div className="flex w-full items-start gap-4 p-4">
        <div className="flex h-32 w-24 shrink-0 items-center justify-center">
            {coverId ? (
                <Img className={coverClassName} src={"https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg?default=false"}
                    loader={<Skeleton count={1} width={96} height={128} borderRadius={0} inline={true}/>}
                    unloader={<img className={coverClassName} src={fallbackCover} alt="" />}
                />
            ) : (
                <img className={coverClassName} src={fallbackCover} alt="" />
            )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="font-bold lead">{data.title}</p>
            <div className="flex flex-row gap-4">
                {extractYear(data.publish_date) &&
                    <p className="text-sm">{extractYear(data.publish_date)}</p>
                }
                {data.physical_format &&
                    <Badge color="dark">{data.physical_format}</Badge>
                }
                
                {data.languages?.map(function(lang) {
                    const code = lang.key.replace("/languages/", "");
                    const flag = languageFlags[code] ? languageFlags[code] : "🏳️";
                    return (
                        <p className="text-sm">{flag}</p>
                    )
            })}
            </div>
            <p className="text-sm font-sans">{t("book.pages")}: {data.number_of_pages || "N/A"}</p>
            <p className="text-sm font-sans">ISBN: {isbn}</p>
            {isbn === selected_isbn &&
                <Badge color="success">{t("editions.current")}</Badge>
            }

        </div>
    </div>
    )
}

export default EditionItem
