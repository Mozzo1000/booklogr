import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { RiSearch2Line } from "react-icons/ri";
import ESCIcon from "./ESCIcon";
import { Img } from 'react-image'

function SearchBar(props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [noSuggestionsFound, setNoSuggestionsFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const loadingPlaceholder = [0,1,2,3,4,5]
  
    const fetchSuggestions = (searchTerm) => {
      if (searchTerm) {
        axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=10&offset=0&fields=title,isbn`).then(
            response => {
            let newArray = []
            for (let i = 0; i < response.data.docs.length; i++) {
                newArray.push({id: i, name: response.data.docs[i].title, isbn: response.data.docs[i].isbn[0]})
            }
            setSuggestions(newArray); // Assuming the API returns an array of suggestions*/
            setLoading(false);
            setShowList(true);
            setNoSuggestionsFound(false)

            if (response.data.num_found == 0) {
                setSuggestions()
                setNoSuggestionsFound(true)
            }

            },
            error => {
                console.error('Error fetching suggestions:', error);
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
            fetchSuggestions(e.target.value)
        }
    }

    const debouncedChangeHandler = useMemo(
        () => debounce(changeHandler, 500)
    ,[]);

    return (
        <div>
            <TextInput icon={RiSearch2Line} rightIcon={props.hideESCIcon ? "" : ESCIcon} id="search" type="text" placeholder="Search for a book" onChange={(e) => (debouncedChangeHandler(e), setSearchTerm(e.target.value))} value={searchTerm} />
            <div className={`${showList? "block": "hidden"} ${props.absolute? "absolute max-w-md": "relative"} z-10 bg-white pt-10 overflow-y-auto max-h-96 min-w-28 min-h-28`}>
                {loading ? (
                     loadingPlaceholder.map(function() {
                        return (
                            <div>
                                <div className="grid grid-cols-2 grid-rows-1 pt-2 pb-2">
                                    <div className="row-span-2">
                                            <Skeleton count={1} height={100} width={"60%"} />
                                    </div>
                                    <div className="col-start-2">
                                        <Skeleton count={2} width={850} />
                                    </div>
                                </div>
                                <hr/>
                            </div>
                        )
                    })
                ): (
                    suggestions?.map(function(data) {
                        return (
                            <div key={data.id}>
                            <div className="grid grid-cols-2 grid-rows-1 pt-2 pb-2">
                                <div className="row-span-2">
                                    <Img className="object-contain h-24 w-24" src={"https://covers.openlibrary.org/b/isbn/" + data.isbn + "-S.jpg?default=false"} 
                                        loader={<Skeleton count={1} width={100} height={"100%"} borderRadius={0} inline={true}/>}
                                        unloader={<img className="object-contain h-24 w-24" src="/fallback-cover.svg"/>}
                                    />
                                </div>
                                <div className="col-start-2">
                                    <Link to={"/books/" + data.isbn} onClick={() => showList(false)}>
                                        <p>{data.name}</p>
                                        {data.isbn}
                                    </Link>
                                </div>
                            </div>
                            <hr/>
                            </div>
                        )
                    })
                )}
                {noSuggestionsFound &&
                <div className="flex flex-col justify-center items-center text-center gap-4 pb-8">
                    <RiSearch2Line size={96}/>
                    <div className="format lg:format-lg">
                        <h2>No results found</h2>
                        <p>Try searching for a different title or isbn.</p>
                    </div>
                </div>
                }
            </div>
            {props.showAttribution &&
                <p className="format pt-2 ml-2 text-xs text-gray-500 font">Search powered by <a href="https://openlibrary.org" target="_blank">OpenLibrary</a></p>
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