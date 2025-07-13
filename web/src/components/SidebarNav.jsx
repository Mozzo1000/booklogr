import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar'
import { Sidebar, SidebarLogo, SidebarItem, SidebarItemGroup, SidebarItems, Modal, ModalBody, ModalHeader} from "flowbite-react";
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { RiBook2Line } from "react-icons/ri";
import { RiUser3Line } from "react-icons/ri";
import { RiLogoutBoxLine } from "react-icons/ri";
import { RiSideBarLine } from "react-icons/ri";
import { RiSideBarFill  } from "react-icons/ri";
import { RiSearch2Line } from "react-icons/ri";
import { RiLoginBoxLine } from "react-icons/ri";
import { RiSettings4Line } from "react-icons/ri";
import { useTranslation } from 'react-i18next';

const customTheme = {
  root: {
    inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-transparent dark:bg-transparent py-4 px-3 border-r border-gray-200 dark:border-gray-700",
  }
};

export default function SidebarNav() {
    const [sidebarState, setSidebarState] = useState(true);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    let location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            setOpenSearchModal(true);
        }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
        <Sidebar collapsed={sidebarState} theme={customTheme} className="hidden md:block">
          <SidebarLogo as={Link} href="/" img="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo">
            <span className="self-center whitespace-nowrap text-xl dark:text-white font-[800]">BookLogr</span>
          </SidebarLogo>
            <SidebarItems>
                  <SidebarItemGroup>
                    {sidebarState ? (
                      <SidebarItem icon={RiSearch2Line} onClick={() => setOpenSearchModal(true)}>{t("navigation.search")}</SidebarItem>
                    ) :( 
                    <SidebarItem><SearchBar hideESCIcon={true} showAttribution={false}></SearchBar></SidebarItem>
                    )}
                  </SidebarItemGroup>
                  <SidebarItemGroup>
                    <SidebarItem as={Link} to="/library" active={location.pathname == "/library"} icon={RiBook2Line}>{t("navigation.library")}</SidebarItem>
                    <SidebarItem as={Link} to="/profile" active={location.pathname == "/profile"} icon={RiUser3Line }>{t("navigation.profile")}</SidebarItem>

                    <SidebarItem as={Link} to="/settings" active={location.pathname == "/settings"} icon={RiSettings4Line}>{t("navigation.settings")}</SidebarItem>

                    {AuthService.getCurrentUser() ? ( 
                      <SidebarItem href="" onClick={() => (AuthService.logout(), navigate("/"))} icon={RiLogoutBoxLine}>{t("navigation.logout")}</SidebarItem>
                    ):(
                      <Link to="/login">
                        <SidebarItem href="" icon={RiLoginBoxLine}>{t("forms.login")}</SidebarItem>
                      </Link>
                    )}
                </SidebarItemGroup>
                <SidebarItemGroup>
                  <SidebarItem icon={sidebarState ? RiSideBarFill : RiSideBarLine  } onClick={() => setSidebarState(!sidebarState)}>
                    {sidebarState ? (
                      <span>{t("navigation.expand")}</span>
                    ): (
                      <span>{t("navigation.collapse")}</span>
                    )}
                  </SidebarItem>
                </SidebarItemGroup>
            </SidebarItems>
        </Sidebar>

        {/* Mobile bottom navigation bar */}
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                <Link to="/library" className={`inline-flex flex-col pt-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname == "/library" ? "bg-gray-800" : "bg-none"}`}>
                  <button type="button" className="rounded-lg inline-flex flex-col items-center justify-center px-5 dark:hover:bg-gray-800 group">
                      <RiBook2Line className="w-5 h-5 mb-2 dark:text-white"/>
                      <span className="text-sm dark:text-white">{t("navigation.library")}</span>
                  </button>
                </Link>
                
                <button type="button" className="rounded-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpenSearchModal(true)}>
                    <RiSearch2Line className="w-5 h-5 mb-2 dark:text-white"/>
                    <span className="text-sm dark:text-white">{t("navigation.search")}</span>
                </button>

                <Link to="/profile" className={`inline-flex flex-col pt-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname == "/profile" ? "bg-gray-800" : "bg-none"}`}>
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <RiUser3Line className="w-5 h-5 mb-2 dark:text-white"/>
                      <span className="text-sm dark:text-white">{t("navigation.profile")}</span>
                  </button>
                </Link>
                <Link to="/settings" className={`inline-flex flex-col pt-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname == "/settings" ? "bg-gray-800" : "bg-none"}`}>
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 group dark:hover:bg-gray-800">
                      <RiSettings4Line className="w-5 h-5 mb-2 dark:text-white"/>
                      <span className="text-sm dark:text-white">{t("navigation.settings")}</span>
                  </button>
                </Link>
            </div>
        </div>
        
        {/* Modal for search */}
        <Modal dismissible show={openSearchModal} onClose={() => setOpenSearchModal(false)} position={"top-center"}>
            <ModalBody>
                <ModalHeader className='md:hidden border-b-0 pb-1 pt-0'></ModalHeader>  
                <SearchBar absolute={false} hideESCIcon={false} onNavigate={() =>setOpenSearchModal(false)}/>
            </ModalBody>
        </Modal>
        </>
    )
}