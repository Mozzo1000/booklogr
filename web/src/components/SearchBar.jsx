import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { Spinner, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([{id: 0, name: ""}]);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);

  
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
                    <Spinner />
                ): (
                    suggestions?.map(function(data) {
                        return (
                            <>  
                            <div className="grid grid-cols-2 grid-rows-1 pt-2">
                                <div className="row-span-2">
                                    <img className="object-contain h-24 w-24" src={"https://covers.openlibrary.org/b/isbn/" + data.isbn +"-S.jpg"} />
                                </div>
                                <div className="col-start-2">
                                    <Link to={"/books/" + data.isbn} onClick={() => showList(false)}>
                                        <p key={data.id}>{data.name}</p>
                                        {data.isbn}
                                    </Link>

                                </div>
                                
                            </div>
                            <hr/>
                            </>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default SearchBar