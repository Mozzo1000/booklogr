import React, { useState, useEffect, useMemo } from "react";
import { debounce } from 'lodash';
import { Button, TextInput, HR, useThemeMode } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RiSearch2Line, RiErrorWarningLine } from "react-icons/ri";
import { Img } from 'react-image';
import { useTranslation, Trans } from 'react-i18next';
import ESCIcon from "./ESCIcon";
import AddBookButton from "./AddBookButton";
import BooksService from "../services/books.service";

function SearchBar(props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [noSuggestionsFound, setNoSuggestionsFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const loadingPlaceholder = [0,1,2,3,4,5];
    const [isFocused, setIsFocused] = useState(false); 
    const [onError, setOnError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    
    let navigate = useNavigate();
    const theme = useThemeMode();
    const { t } = useTranslation();

    const fetchSuggestions = (searchTerm) => {
        if (searchTerm) {
            BooksService.search(searchTerm).then(
                response => {
                    let newArray = []
                    for (let i = 0; i < response.data.items.length; i++) {
                        newArray.push({
                            id: i, name: response.data.items[i].title,
                            isbn: response.data.items[i].isbn, 
                            author: response.data.items[i].author,
                            inLibrary: response.data.items[i].in_library,
                        })
                    }
                    setSuggestions(newArray);
                    setLoading(false);
                    setShowList(true);
                    setNoSuggestionsFound(false)
                    setOnError(false);
                    setErrorMessage();
                    
                    if (response.data.num_found == 0) {
                        setSuggestions([])
                        setNoSuggestionsFound(true)
                    }
                },
                error => {
                    setLoading(false);
                    setOnError(true);
                    setErrorMessage(error.code)
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

    const debouncedChangeHandler = useMemo(() => debounce(changeHandler, 500), []);

    const closeSearch = () => {
        setIsFocused(false);
        setShowList(false);
        setSearchTerm('');
        props.onClose();
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const inLibraryBooks = suggestions.filter(b => b.inLibrary);
    const otherBooks = suggestions.filter(b => !b.inLibrary);

    const SectionHeader = ({ title }) => (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 my-2 rounded-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {title}
            </span>
        </div>
    );

    return (
        <div className={`
            ${(isFocused || showList) 
                ? "max-md:fixed max-md:inset-0 max-md:z-60 max-md:bg-white max-md:dark:bg-gray-900 max-md:p-4 max-md:flex max-md:flex-col" 
                : "relative w-full"}
        `}>
            <div className="flex flex-row gap-2 items-center">
                <div className="flex-1">
                    <TextInput 
                        autoFocus={true}
                        icon={RiSearch2Line} 
                        rightIcon={props.hideESCIcon || isMobile ? "" : ESCIcon} 
                        id="search" 
                        type="text" 
                        placeholder={t("search.input_placeholder")} 
                        onFocus={() => setIsFocused(true)}
                        onChange={(e) => (debouncedChangeHandler(e), setSearchTerm(e.target.value))} 
                        value={searchTerm} 
                    />
                </div>
                
                {isMobile && (
                    <Button onClick={closeSearch} color="alternative">
                        {t("forms.cancel")}
                    </Button>
                )}

                {!props.hideAddBookButton &&
                    <AddBookButton collapseButton={true}/>
                }
            </div>

            <div className={`
                ${showList ? "block" : "hidden"} 
                ${props.absolute ? "md:absolute md:max-w-md" : "relative"} 
                z-10 bg-white dark:bg-inherit overflow-y-auto 
                max-md:flex-1 max-md:w-full
                md:max-h-1/2 min-w-28 min-h-28
            `}>
                {loading ? (
                     loadingPlaceholder.map((i) => (
                        <div key={i}>
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
                    ))
                ) : (
                    <>
                        {inLibraryBooks.length > 0 && (
                            <>
                                <SectionHeader title={t("search.in_library")} />
                                {inLibraryBooks.map((data) => (
                                    <Link key={data.id} to={"/books/" + data.isbn} onClick={(e) => (props.onNavigate(), closeSearch(), navigate("/books/" + data.isbn))}>
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
                                ))}
                            </>
                        )}

                        {otherBooks.length > 0 && (
                            <>
                                <SectionHeader title={t("search.results")} />
                                {otherBooks.map((data) => (
                                    <Link key={data.id} to={"/books/" + data.isbn} onClick={(e) => (props.onNavigate(), closeSearch(), navigate("/books/" + data.isbn))}>
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
                                ))}
                            </>
                        )}
                    </>
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
                        <p>{t("search.error_unknown.description", {error: errorMessage})}</p>
                    </div>
                </div>
                }
            </div>

            {props.showAttribution && !showList && (
                <p className="format dark:format-invert pt-2 ml-2 text-xs text-gray-500 font">
                    <Trans i18nKey="search.attribution"
                        components={{
                            link_to_info: (
                                <a href="https://openlibrary.org" target="_blank" rel="noreferrer" />
                            )
                        }}
                    />
                </p>
            )}
        </div>
    )
}

SearchBar.defaultProps = {
    absolute: true,
    hideESCIcon: true,
    showAttribution: true
}

export default SearchBar;