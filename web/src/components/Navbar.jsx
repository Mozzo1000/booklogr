import React, {useState} from 'react';
import SearchBar from '../components/SearchBar'
import { Sidebar, Modal } from 'flowbite-react'
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaBook } from "react-icons/fa6";
import { FaCircleUser } from "react-icons/fa6";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { FaRightFromBracket } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

const customTheme = {
  root: {
    inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-[#FDFCF7] py-4 px-3 dark:bg-gray-800 border-r",
  }
};

function NavigationMenu() {
    const [sidebarState, setSidebarState] = useState(true);
    const [openSearchModal, setOpenSearchModal] = useState(false);

    return (
        <>
        <Sidebar collapsed={sidebarState} theme={customTheme} className="min-h-screen">
          <Sidebar.Logo as={Link} href="/" img="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo">
            <span className="self-center whitespace-nowrap text-xl dark:text-white font-[800]">BookLogr</span>
          </Sidebar.Logo>
            <Sidebar.Items>
                  <Sidebar.ItemGroup>
                    {sidebarState ? (
                      <Sidebar.Item icon={FaMagnifyingGlass} onClick={() => setOpenSearchModal(true)}>Search</Sidebar.Item>
                    ) :( 
                    <Sidebar.Item><SearchBar></SearchBar></Sidebar.Item>
                    )}
                  </Sidebar.ItemGroup>
                  <Sidebar.ItemGroup>
                    <Link to="/">
                      <Sidebar.Item icon={FaBook}><span className="font-semibold">My Library</span></Sidebar.Item>
                    </Link>
                    <Link to="/profile">
                      <Sidebar.Item icon={FaCircleUser }><span>Profile</span></Sidebar.Item>
                    </Link>
                    {AuthService.getCurrentUser() && 
                      <Sidebar.Item href="" onClick={() => (AuthService.logout(), navigate("/"))} icon={FaRightFromBracket}>Logout</Sidebar.Item>
                    }
                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                  <Sidebar.Item icon={sidebarState ? TbLayoutSidebarRightCollapseFilled : TbLayoutSidebarLeftCollapseFilled } onClick={() => setSidebarState(!sidebarState)}>
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
                <SearchBar />
            </Modal.Body>
        </Modal>
        </>
    )
}

export default NavigationMenu