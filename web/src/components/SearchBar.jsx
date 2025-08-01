import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { RiSearch2Line } from "react-icons/ri";
import ESCIcon from "./ESCIcon";
import { Img } from 'react-image'
import { RiErrorWarningLine } from "react-icons/ri";
import { HR } from "flowbite-react";
import { useThemeMode } from 'flowbite-react';
import { useTranslation, Trans } from 'react-i18next';

function SearchBar(props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [noSuggestionsFound, setNoSuggestionsFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const loadingPlaceholder = [0,1,2,3,4,5]
    const [onError, setOnError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    let navigate = useNavigate();
    const theme = useThemeMode();
    const { t } = useTranslation();

    const fetchSuggestions = (searchTerm) => {
      if (searchTerm) {
        axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=10&offset=0&fields=title,isbn,author_name,key&lang=en`).then(
            response => {
            let newArray = []
            for (let i = 0; i < response.data.docs.length; i++) {
                if (response.data.docs[i].isbn) {
                    newArray.push({
                        id: i, name: response.data.docs[i].title,
                        isbn: response.data.docs[i].isbn[0], 
                        author: response.data.docs[i].author_name[0],
                        cover: response.data.docs[i].cover_i
                    })
                }
            }
            setSuggestions(newArray); // Assuming the API returns an array of suggestions*/
            setLoading(false);
            setShowList(true);
            setNoSuggestionsFound(false)

            setOnError(false);
            setErrorMessage();

            if (response.data.num_found == 0) {
                setSuggestions()
                setNoSuggestionsFound(true)
            }

            },
            error => {
                setLoading(false);
                setOnError(true);
                setErrorMessage(error.code)
                console.error('Error fetching suggestions:', error.code);
            }
        )
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setLoading(false);
            setShowList(false);
        } 
    }, [searchTerm]);

    const changeHandler = (e) => {
        if (e.target.value) {
            setLoading(true);
            setShowList(true);
            setOnError(false);
            setErrorMessage();
            fetchSuggestions(e.target.value)
        }
    }

    const debouncedChangeHandler = useMemo(
        () => debounce(changeHandler, 500)
    ,[]);

    return (
        <div>
            <TextInput icon={RiSearch2Line} rightIcon={props.hideESCIcon ? "" : ESCIcon} id="search" type="text" placeholder={t("search.input_placeholder")} onChange={(e) => (debouncedChangeHandler(e), setSearchTerm(e.target.value))} value={searchTerm} />
            <div className={`${showList? "block": "hidden"} ${props.absolute? "absolute max-w-md": "relative"} z-10 bg-white pt-10 overflow-y-auto md:max-h-1/2 max-h-96 min-w-28 min-h-28 dark:bg-inherit`}>
                {loading ? (
                     loadingPlaceholder.map(function() {
                        return (
                            <div>
                                <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 gap-4">
                                    <div className="lg:row-span-2">
                                            <Skeleton count={1} height={100} width={"60%"} />
                                    </div>
                                    <div className="row-span-2">
                                        <Skeleton count={2} width={"100%"} />
                                    </div>
                                </div>
                                <HR />
                            </div>
                        )
                    })
                    
                ): (
                    suggestions?.map(function(data) {
                        return (
                            <Link key={data.id} to={"/books/" + data.isbn} onClick={(e) => (props.onNavigate(), navigate("/books/" + data.isbn))}>
                                <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 gap-4">
                                    <div className="lg:row-span-2 md:mx-auto">
                                        <Img className="object-contain h-32" src={"https://covers.openlibrary.org/b/isbn/" + data.isbn + "-M.jpg?default=false"} 
                                            loader={<Skeleton count={1} width={100} height={"100%"} borderRadius={0} inline={true}/>}
                                            unloader={theme.mode == "dark" && <img className="object-contain h-32" src="/fallback-cover-light.svg"/> || theme.mode == "light" && <img className="object-contain h-32" src="/fallback-cover.svg"/>}

                                        />
                                    </div>
                                        <div className="row-span-2">
                                            <div className="flex flex-col gap-1 dark:text-white">
                                                <p className="font-bold lead">{data.name}</p>
                                                <p className="font-semi">{t("book.by_author", {author: data.author})}</p>
                                                <p className="text-sm font-sans">ISBN: {data.isbn}</p>
                                            </div>
                                        </div>
                                </div>
                                <HR />
                            </Link>
                        )
                    })
                )}
                {noSuggestionsFound &&
                <div className="flex flex-col justify-center items-center text-center gap-4 pb-8">
                    <RiSearch2Line size={96} className="dark:text-white"/>
                    <div className="format lg:format-lg dark:format-invert">
                        <h2>{t("search.error_not_found.title")}</h2>
                        <p>{t("search.error_not_found.description")}</p>
                    </div>
                </div>
                }
                {onError &&
                <div className="flex flex-col justify-center items-center text-center gap-4 pb-8">
                    <RiErrorWarningLine size={96} className="dark:text-white"/>
                    <div className="format lg:format-lg dark:format-invert">
                        <h2>{t("search.error_unknown.title")}</h2>
                        <p>
                            <Trans i18nKey="search.error_unknown.description" values={{ error: errorMessage }}
                                components={{
                                    error_text: (
                                        <p className="text-xs" />
                                    ),
                                    link_to_info: (
                                        <a href={"https://github.com/Mozzo1000/booklogr/wiki/Error-messages#" + String(errorMessage).toLowerCase()} />
                                    )
                                }}
                            />
                        </p>
                    </div>
                </div>
                }
            </div>
            {props.showAttribution &&
                <p className="format dark:format-invert pt-2 ml-2 text-xs text-gray-500 font">
                    <Trans i18nKey="search.attribution"
                        components={{
                            link_to_info: (
                            <a href="https://openlibrary.org" target="_blank" />
                            )
                        }}
                    />
                </p>
            }
        </div>
    )
}

SearchBar.defaultProps = {
    absolute: true,
    hideESCIcon: true,
    showAttribution: true
  }
export default SearchBar