import React from 'react'
import { useThemeMode } from 'flowbite-react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Img } from 'react-image'
import { Badge } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function EditionItem({data, selected_isbn}) {
    const theme = useThemeMode();
    const { t } = useTranslation();
    
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
        <>
        <div className="flex justify-items-center p-4">
            <div className="w-1/3 ">
                <Img className="shadow-2xl object-fit rounded" src={"https://covers.openlibrary.org/b/id/" + data.covers?.[0] + "-M.jpg?default=false"} 
                    loader={<Skeleton count={1} width={200} height={200} borderRadius={0} inline={true}/>}
                    unloader={theme.mode == "dark" && <img src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img src="/fallback-cover.svg"/>}
                />
            </div>
        </div>

        <div class="flex flex-col w-2/3 items-start">
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
            <p className="text-sm font-sans">ISBN: {data.isbn_13[0]}</p>
            {data.isbn_13[0] === selected_isbn &&
                <Badge color="success">{t("editions.current")}</Badge>
            }

        </div>
    </>
    )
}

export default EditionItem