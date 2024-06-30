import React, {useState} from 'react';
import SearchBar from '../components/SearchBar'
import { Sidebar, Modal } from 'flowbite-react'
import { IoLibraryOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { GoSidebarCollapse } from "react-icons/go";
import { IoMdSearch } from "react-icons/io";

function NavigationMenu() {
    const [sidebarState, setSidebarState] = useState(true);
    const [openSearchModal, setOpenSearchModal] = useState(false);

    return (
        <>
        <Sidebar collapsed={sidebarState}>
          <Sidebar.Logo href="/" img="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo">
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">minimal reading</span>
          </Sidebar.Logo>
            <Sidebar.Items>
                  <Sidebar.ItemGroup>
                    {sidebarState ? (
                      <Sidebar.Item icon={IoMdSearch} onClick={() => setOpenSearchModal(true)}>Search</Sidebar.Item>
                    ) :( 
                    <Sidebar.Item><SearchBar></SearchBar></Sidebar.Item>
                    )}
                  </Sidebar.ItemGroup>
                  <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={IoLibraryOutline}><span className="font-semibold">My Library</span></Sidebar.Item>
                    <Sidebar.Item href="#" icon={VscAccount }><span>Profile</span></Sidebar.Item>
                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                  <Sidebar.Item icon={GoSidebarCollapse} onClick={() => setSidebarState(!sidebarState)}>
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