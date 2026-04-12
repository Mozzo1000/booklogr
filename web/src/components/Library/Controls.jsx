import { useState } from "react";
import { Button, ButtonGroup, Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { RiGalleryView, RiListView, RiListSettingsLine } from "react-icons/ri";
import SortSelector from "../SortSelector";

function Controls({ sort, setSort, order, setOrder, view, changeView, enableSort = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="flex items-center justify-between w-full">      
      <div className="hidden md:flex items-center gap-4">
        {enableSort &&
          <SortSelector sort={sort} setSort={setSort} order={order} setOrder={setOrder} />
        }
        <ButtonGroup>
            <Button size="sm" color={view === "gallery" ? "default" : "alternative"} onClick={() => changeView("gallery")}>
                <RiGalleryView className="w-6 h-6" />
            </Button>
            <Button size="sm" color={view === "list" ? "default" : "alternative"} onClick={() => changeView("list")}>
                <RiListView className="w-6 h-6" />
            </Button>
        </ButtonGroup>
      </div>

      <div className="flex md:hidden ml-auto">
        <Button color="alternative" size="md" onClick={() => setIsOpen(true)}>
          <RiListSettingsLine className="mr-2 h-5 w-5" />   
        </Button>
      </div>

      <Drawer open={isOpen} onClose={handleClose} position="bottom" className={isOpen ? "mb-16 rounded-t-xl" : "mb-0 rounded-t-xl"}>
        <DrawerHeader title="Layout & Sorting" titleIcon={() => <RiListSettingsLine className="mr-2" />} />
        <DrawerItems>
          <div className="space-y-6 mt-4">
            <section>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Switch View</h4>
              <ButtonGroup className="w-full">
                <Button className="grow"color={view === "gallery" ? "default" : "alternative"} onClick={() => changeView("gallery")}>
                  <RiGalleryView className="mr-2 h-5 w-5" />
                   Gallery
                </Button>
                <Button className="grow"color={view === "list" ? "default" : "alternative"} onClick={() => changeView("list")}>
                  <RiListView className="mr-2 h-5 w-5" /> 
                  List
                </Button>
              </ButtonGroup>
            </section>
            {enableSort &&
              <section className="mb-3">
                <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Sort and order</h4>
                  <SortSelector sort={sort} setSort={setSort} order={order} setOrder={setOrder} />
              </section>
            }
          </div>
        </DrawerItems>
      </Drawer>
    </div>
  );
}

export default Controls;