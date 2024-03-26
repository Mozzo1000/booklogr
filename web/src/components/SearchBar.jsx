import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { Spinner, TextInput } from "flowbite-react";
import OpenLibraryButton from "./OpenLibraryButton";

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [loading, setLoading] = useState(false);

  
    const fetchSuggestions = (searchTerm) => {
      if (searchTerm) {
        axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(searchTerm)}&limit=2&offset=0?`).then(
            response => {
            let newArray = []
            for (let i = 0; i < response.data.docs.length; i++) {
                console.log(response.data.docs[i].title)
                newArray.push({id: i, name: response.data.docs[i].title, isbn: response.data.docs[i].isbn[0]})
            }
            setSuggestions(newArray); // Assuming the API returns an array of suggestions*/
            setLoading(false);
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
            console.log("Hi")
        } 
    }, [searchTerm]);

    const changeHandler = (e) => {
        if (e.target.value) {
            setLoading(true);
            fetchSuggestions(e.target.value)
        }
    }

    const debouncedChangeHandler = useMemo(
        () => debounce(changeHandler, 500)
      , []);

    return (
        <div>
            <TextInput id="search" type="text" placeholder="Search for a book" onChange={(e) => (debouncedChangeHandler(e), setSearchTerm(e.target.value))} value={searchTerm} />
            {loading ? (
                <Spinner />
            ): (
                suggestions?.map(function(data) {
                    return (
                        <>  
                        <div className="grid grid-cols-5 grid-rows-5">
                            <div className="row-span-2">
                                <img src={"https://covers.openlibrary.org/b/isbn/" + data.isbn +"-S.jpg"} />
                            </div>
                            <div ><p key={data.id}>{data.name}</p></div>
                            <div className="col-start-2 row-start-2">
                                {data.isbn} 
                                <OpenLibraryButton isbn={data.isbn} />
                            </div>
                        </div>
                        </>
                    )
                })
            )}
        </div>
    )
}

export default SearchBar