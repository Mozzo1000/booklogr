import React, { useEffect, useState, useMemo } from 'react'
import ProfileService from '../services/profile.service';
import { Button, TextInput, Label, Badge } from "flowbite-react";
import useToast from '../toast/useToast';
import BookItem from '../components/Library/BookItem';
import PaneTabView from '../components/Library/PaneTabView';
import { FaEye } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import BookStatsCard from '../components/BookStatsCard';
import { FaBook } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa6";
import { FaBookOpen } from "react-icons/fa6";

function Profile() {
    const [data, setData] = useState();
    const [noProfile, setNoProfile] = useState();
    const [createDisplayName, setCreateDisplayName] = useState();
    const [readingStatusFilter, setReadingStatusFilter] = useState("All");
    const toast = useToast(4000);
    let { name } = useParams();

    const filteredBooks = useMemo(() => {
        if (data) {
            if (readingStatusFilter == "All") {
                return data.books;
            } else {
                return data.books.filter(data => data.reading_status.toLowerCase() === readingStatusFilter.toLowerCase());
            }
        }
      }, [data, readingStatusFilter]);
    

    useEffect(() => {
        if (name) {
            ProfileService.get_by_display_name(name).then(
                response => {
                    setData(response.data)
                    setNoProfile(false);
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    toast("error", resMessage);
                }
            )
        } else {
            ProfileService.get().then(
                response => {
                    console.log(response.data)
                    setData(response.data)
                    setNoProfile(false);
                },
                error => {
                    if (error.response) {
                        console.log(error.response.status)
                        if (error.response.status == 404) {
                            setNoProfile(true);
                        }
                    }
                }
            )
        }
    }, [])

    const handleCreateProfile = (e) => {
        e.preventDefault();
        ProfileService.create({"display_name": createDisplayName}).then(
            response => {
                toast("success", response.data.message);
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
            }
        )
    }


    return (
        <div>
            {noProfile &&
                <>
                <h1>Create profile</h1>
                <form className="flex max-w-md flex-col gap-4" onSubmit={handleCreateProfile}>
                    <div>
                        <div className="mb-2 block">
                        <Label htmlFor="displayname" value="Display name" />
                        </div>
                        <TextInput id="displayname" type="text" required value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} />
                    </div>         
                    <Button type="submit">Create</Button>
                </form>
                </>
            }
            {data &&
                <div>
                    <div className="format lg:format-lg">
                        <div className="flex flex-row justify-start gap-4">
                            <h2 >{data.display_name}</h2> 
                            <Badge icon={FaEye} >{data.visibility}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-row gap-16 pt-8 justify-around">
                        <BookStatsCard icon={<FaBook className="w-8 h-8"/>} number={data.num_books_read} text="Read"/>
                        <BookStatsCard icon={<FaBookOpen className="w-8 h-8"/>} number={data.num_books_reading} text="Reading"/>
                        <BookStatsCard icon={<FaBookmark className="w-8 h-8"/>} number={data.num_books_tbr} text="To Be Read"/>
                    </div>
                    <div className="inline-flex items-center justify-center w-full">
                        <hr className="w-full h-px my-8 bg-gray-200 border-0" />
                        <span className="absolute font-medium text-gray-900 -translate-x-1/3 bg-white ">All books</span>
                    </div>
                    <Button.Group className="pb-4">
                        <Button color="gray" onClick={() => setReadingStatusFilter("All")}>All ({data.books.length})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("Read")}>Read ({data.num_books_read})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("Currently reading")}>Currently reading ({data.num_books_reading})</Button>
                        <Button color="gray" onClick={() => setReadingStatusFilter("To be read")}>To be read ({data.num_books_tbr})</Button>
                    </Button.Group>
                    <PaneTabView>
                    {filteredBooks.map((item) => {
                        return (
                            <div key={0}>
                                <BookItem internalID={0} showReadingStatusBadge={true} showOptions={false} showProgress={false} title={item.title} isbn={item.isbn} totalPages={item.total_pages} currentPage={item.current_page} author={item.author} readingStatus={item.reading_status} />
                            </div>
                        )
                    })}
                    </PaneTabView>
                </div>
            }
        </div>
    )
}

export default Profile