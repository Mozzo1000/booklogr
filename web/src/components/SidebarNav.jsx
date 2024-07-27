import React, {useState} from 'react';
import SearchBar from './SearchBar'
import { Sidebar, Modal } from 'flowbite-react'
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
    inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-[#FDFCF7] py-4 px-3 dark:bg-gray-800 border-r",
  }
};

function SidebarNav() {
    const [sidebarState, setSidebarState] = useState(true);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    let location = useLocation();

    return (
        <>
        <Sidebar collapsed={sidebarState} theme={customTheme} className="hidden md:block">
          <Sidebar.Logo as={Link} href="/" img="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo">
            <span className="self-center whitespace-nowrap text-xl dark:text-white font-[800]">BookLogr</span>
          </Sidebar.Logo>
            <Sidebar.Items>
                  <Sidebar.ItemGroup>
                    {sidebarState ? (
                      <Sidebar.Item icon={RiSearch2Line} onClick={() => setOpenSearchModal(true)}>Search</Sidebar.Item>
                    ) :( 
                    <Sidebar.Item><SearchBar showAttribution={false}></SearchBar></Sidebar.Item>
                    )}
                  </Sidebar.ItemGroup>
                  <Sidebar.ItemGroup>
                    <Sidebar.Item as={Link} to="/library" active={location.pathname == "/library"} icon={RiBook2Line}>My Library</Sidebar.Item>
                    <Sidebar.Item as={Link} to="/profile" active={location.pathname == "/profile"} icon={RiUser3Line }>Profile</Sidebar.Item>

                    <Sidebar.Item as={Link} to="/settings" active={location.pathname == "/settings"} icon={RiSettings4Line}>Settings</Sidebar.Item>

                    {AuthService.getCurrentUser() ? ( 
                      <Sidebar.Item href="" onClick={() => (AuthService.logout(), navigate("/"))} icon={RiLogoutBoxLine}>Logout</Sidebar.Item>
                    ):(
                      <Link to="/login">
                        <Sidebar.Item href="" icon={RiLoginBoxLine}>Login</Sidebar.Item>
                      </Link>
                    )}
                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                  <Sidebar.Item icon={sidebarState ? RiSideBarFill : RiSideBarLine  } onClick={() => setSidebarState(!sidebarState)}>
                    {sidebarState ? (
                      <span>Expand</span>
                    ): (
                      <span>Collapse</span>
                    )}
                  </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>

        {/* Mobile bottom navigation bar */}
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                <Link to="/library" className="inline-flex flex-col pt-2">
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <RiBook2Line className={`w-5 h-5 mb-2 group-hover:text-blue-600 ${location.pathname == "/library" ? "text-blue-600" : "text-gray-500"}`}/>
                      <span className={`text-sm dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 ${location.pathname == "/library" ? "text-blue-600" : "text-gray-500"}`}>Library</span>
                  </button>
                </Link>
                
                <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpenSearchModal(true)}>
                    <RiSearch2Line className="w-5 h-5 mb-2 text-gray-500 group-hover:text-blue-600"/>
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Search</span>
                </button>

                <Link to="/profile" className="inline-flex flex-col pt-2">
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <RiUser3Line className={`w-5 h-5 mb-2 group-hover:text-blue-600 ${location.pathname == "/profile" ? "text-blue-600" : "text-gray-500"}`}/>
                      <span className={`text-sm dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 ${location.pathname == "/profile" ? "text-blue-600" : "text-gray-500"}`}>Profile</span>
                  </button>
                </Link>
                <Link to="/settings" className="inline-flex flex-col pt-2">
                  <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <RiSettings4Line className={`w-5 h-5 mb-2 group-hover:text-blue-600 ${location.pathname == "/settings" ? "text-blue-600" : "text-gray-500"}`}/>
                      <span className={`text-sm dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 ${location.pathname == "/settings" ? "text-blue-600" : "text-gray-500"}`}>Settings</span>
                  </button>
                </Link>
            </div>
        </div>
        
        {/* Modal for search */}
        <Modal dismissible show={openSearchModal} onClose={() => setOpenSearchModal(false)} position={"top-center"} size="md">
            <Modal.Body>
                <SearchBar absolute={false} hideESCIcon={false}/>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default SidebarNav