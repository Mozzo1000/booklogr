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
        <Sidebar collapsed={sidebarState} theme={customTheme}>
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
                    <Link to="/library">
                      <Sidebar.Item active={location.pathname == "/library"} icon={RiBook2Line}>My Library</Sidebar.Item>
                    </Link>
                    <Link to="/profile">
                      <Sidebar.Item active={location.pathname == "/profile"} icon={RiUser3Line }>Profile</Sidebar.Item>
                    </Link>
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
        
        <Modal dismissible show={openSearchModal} onClose={() => setOpenSearchModal(false)} position={"top-center"}>
            <Modal.Body>
                <SearchBar absolute={false} hideESCIcon={false}/>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default SidebarNav