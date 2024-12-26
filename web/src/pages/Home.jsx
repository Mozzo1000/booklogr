import { Button } from 'flowbite-react';
import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FeatureSection from '../components/FeatureSection';
import CTA from '../components/CTA';
import AuthService from '../services/auth.service';
import AnimatedLayout from '../AnimatedLayout';

function Home() {
    let navigate = useNavigate();
    useEffect(() => {
        if(String(import.meta.env.VITE_DISABLE_HOMEPAGE).toLowerCase() === "true") {
            return navigate("/library")
        }
        if(AuthService.getCurrentUser()) {
            return navigate("/library")
        }
    }, [])
    

    return (
        <AnimatedLayout>
        <div className="min-h-screen flex flex-col justify-between">
        <section className="md:bg-[length:100%] h-screen bg-no-repeat bg-bottom bg-wave-pattern">
            <div className="grid max-w-screen-xl px-4 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">Keep Track of Your Reading Journey</h1>
                    <p className="max-w-2xl mb-6 text-black lg:mb-8 md:text-lg lg:text-xl">Track your reading progress and share your library with friends using BookLogr.</p>
                    <div className="flex gap-4">
                        <Button as={Link} to="/login">Get started!</Button>
                    </div>
                </div>
                <div className="mt-20 lg:mt-0 lg:col-span-5 invisible md:visible">
                    <img src="/ReadingSideDoodle.svg" alt="mockup"/>
                </div>
            </div>
        </section>
        <FeatureSection />
        <CTA />
        </div>
        </AnimatedLayout>
    )
}

export default Home