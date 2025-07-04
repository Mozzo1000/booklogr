import { Footer as FFooter, FooterCopyright, FooterLink, FooterLinkGroup, FooterIcon } from 'flowbite-react';
import { IoLogoGithub } from "react-icons/io";
import { DarkThemeToggle } from "flowbite-react";

function Footer() {
  return (
    <FFooter container className="hidden md:block bg-transparent dark:bg-transparent sticky top-[100vh] z-10 border-none shadow-none ">
      <div className="w-full sm:flex sm:items-center sm:justify-between">
        <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center items-center">
            <p className="format dark:format-invert text-xs">v{import.meta.env.VITE_APP_VERSION}</p>
            <FooterIcon target="_blank" href="https://github.com/Mozzo1000/booklogr" icon={IoLogoGithub}/>
        </div>
        <DarkThemeToggle />
     </div>
    </FFooter>
  )
}

export default Footer