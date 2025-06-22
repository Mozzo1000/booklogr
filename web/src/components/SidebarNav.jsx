import React, {useState} from 'react';
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

const customTheme = {
  root: {
    inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-[#FDFCF7] py-4 px-3 dark:bg-gray-800 border-r border-gray-200",
  }
};

export default function SidebarNav() {
    const [sidebarState, setSidebarState] = useState(true);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    let location = useLocation();

    return (
        <>
        <Sidebar collapsed={sidebarState} theme={customTheme} className="hidden md:block">
          <SidebarLogo as={Link} href="/" img="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo">
            <span className="self-center whitespace-nowrap text-xl dark:text-white font-[800]">BookLogr</span>
          </SidebarLogo>
            <SidebarItems>
                  <SidebarItemGroup>
                    {sidebarState ? (
                      <SidebarItem icon={RiSearch2Line} onClick={() => setOpenSearchModal(true)}>Search</SidebarItem>
                    ) :( 
                    <SidebarItem><SearchBar showAttribution={false}></SearchBar></SidebarItem>
                    )}
                  </SidebarItemGroup>
                  <SidebarItemGroup>
                    <SidebarItem as={Link} to="/library" active={location.pathname == "/library"} icon={RiBook2Line}>My Library</SidebarItem>
                    <SidebarItem as={Link} to="/profile" active={location.pathname == "/profile"} icon={RiUser3Line }>Profile</SidebarItem>

                    <SidebarItem as={Link} to="/settings" active={location.pathname == "/settings"} icon={RiSettings4Line}>Settings</SidebarItem>

                    {AuthService.getCurrentUser() ? ( 
                      <SidebarItem href="" onClick={() => (AuthService.logout(), navigate("/"))} icon={RiLogoutBoxLine}>Logout</SidebarItem>
                    ):(
                      <Link to="/login">
                        <SidebarItem href="" icon={RiLoginBoxLine}>Login</SidebarItem>
                      </Link>
                    )}
                </SidebarItemGroup>
                <SidebarItemGroup>
                  <SidebarItem icon={sidebarState ? RiSideBarFill : RiSideBarLine  } onClick={() => setSidebarState(!sidebarState)}>
                    {sidebarState ? (
                      <span>Expand</span>
                    ): (
                      <span>Collapse</span>
                    )}
                  </SidebarItem>
                </SidebarItemGroup>
            </SidebarItems>
        </Sidebar>

        {/* Mobile bottom navigation bar */}
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                <Link to="/library" className={`inline-flex flex-col pt-2 hover:bg-gray-100 ${location.pathname == "/library" ? "bg-gray-100" : "bg-none"}`}>
                  <button type="button" className="rounded-lg inline-flex flex-col items-center justify-center px-5 group">
                      <RiBook2Line className="w-5 h-5 mb-2"/>
                      <span className="text-sm dark:text-gray-400">Library</span>
                  </button>
                </Link>
                
                <button type="button" className="rounded-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpenSearchModal(true)}>
                    <RiSearch2Line className="w-5 h-5 mb-2"/>
                    <span className="text-sm dark:text-gray-400">Search</span>
                </button>

                <Link to="/profile" className={`inline-flex flex-col pt-2 hover:bg-gray-100 ${location.pathname == "/profile" ? "bg-gray-100" : "bg-none"}`}>
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <RiUser3Line className="w-5 h-5 mb-2"/>
                      <span className="text-sm dark:text-gray-400">Profile</span>
                  </button>
                </Link>
                <Link to="/settings" className={`inline-flex flex-col pt-2 hover:bg-gray-100 ${location.pathname == "/settings" ? "bg-gray-100" : "bg-none"}`}>
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 group">
                      <RiSettings4Line className="w-5 h-5 mb-2"/>
                      <span className="text-sm dark:text-gray-400">Settings</span>
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