import { Footer as FFooter, FooterCopyright, FooterLink, FooterLinkGroup, FooterIcon } from 'flowbite-react';
import { IoLogoGithub } from "react-icons/io";
import { DarkThemeToggle } from "flowbite-react";
import LanguageSwitcher from './LanguageSwitcher';
import CheckUpdate from './CheckUpdate';

function Footer() {
  return (
    <FFooter container className="hidden md:block bg-transparent dark:bg-transparent sticky top-[100vh] z-10 border-none shadow-none ">
      <div className="w-full sm:flex sm:items-center sm:justify-between">
        <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center items-center">
          <div className="flex flex-row gap-1 items-center">
            <p className="format dark:format-invert text-xs">v{import.meta.env.VITE_APP_VERSION}</p>
            <CheckUpdate currentVersion={import.meta.env.VITE_APP_VERSION}/>
          </div>
          <FooterIcon target="_blank" href="https://github.com/Mozzo1000/booklogr" icon={IoLogoGithub}/>
        </div>
        <div className="flex flex-row gap-4 justify-between">
          <DarkThemeToggle />
          <LanguageSwitcher />
        </div>
     </div>
    </FFooter>
  )
}

export default Footer