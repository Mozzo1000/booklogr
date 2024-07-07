import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
    let navigate = useNavigate();
    useEffect(() => {
        if(import.meta.env.VITE_DISABLE_HOMEPAGE === "true") {
            return navigate("/library")
        }
    }, [])
    

    return (
        <div>Home</div>
    )
}

export default Home