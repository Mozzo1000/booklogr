import { Footer as FFooter, FooterCopyright, FooterLink, FooterLinkGroup, FooterIcon } from 'flowbite-react';
import { IoLogoGithub } from "react-icons/io";
import { DarkThemeToggle } from "flowbite-react";

function Footer() {
  return (
    <FFooter container className="bg-transparent sticky top-[100vh] z-10 border-none shadow-none ">
      <div className="w-full sm:flex sm:items-center sm:justify-between">
        <span></span>
        <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
          <FooterIcon target="_blank" href="https://github.com/Mozzo1000/booklogr" icon={IoLogoGithub}/>
        </div>
        <DarkThemeToggle />
     </div>
    </FFooter>
  )
}

export default Footer