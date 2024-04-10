import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { Spinner, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const loadingPlaceholder = [0,1,2,3,4,5]
  
    const fetchSuggestions = (searchTerm) => {
      if (searchTerm) {
        axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=10&offset=0&fields=title,isbn`).then(
            response => {
            let newArray = []
            for (let i = 0; i < response.data.docs.length; i++) {
                console.log(response.data.docs[i].title)
                newArray.push({id: i, name: response.data.docs[i].title, isbn: response.data.docs[i].isbn[0]})
            }
            setSuggestions(newArray); // Assuming the API returns an array of suggestions*/
            setLoading(false);
            setShowList(true);
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
      , []);

    return (
        <div>
            <TextInput id="search" type="text" placeholder="Search for a book" onChange={(e) => (debouncedChangeHandler(e), setSearchTerm(e.target.value))} value={searchTerm} />
            <div className={`${showList? "block": "hidden"} absolute z-10 bg-white pt-10 max-w-md  overflow-y-auto	max-h-96 min-w-28 min-h-28`}>
                {loading ? (
                     loadingPlaceholder.map(function() {
                        return (
                            <div>
                                <div className="grid grid-cols-2 grid-rows-1 pt-2">
                                    <div className="row-span-2">
                                        <div class="h-24 w-24 bg-gray-300 rounded">
                                            <svg class="h-24 w-24 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                                            </svg>
                                        </div>
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
                            <div className="grid grid-cols-2 grid-rows-1 pt-2">
                                <div className="row-span-2">
                                    <img className="object-contain h-24 w-24" src={"https://covers.openlibrary.org/b/isbn/" + data.isbn +"-S.jpg"} />
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
            </div>
        </div>
    )
}

export default SearchBar