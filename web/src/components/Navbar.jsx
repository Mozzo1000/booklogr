import { Avatar, Dropdown, Navbar, Button } from 'flowbite-react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

function NavigationMenu() {
    return (
        <Navbar border>
        <Navbar.Brand as={Link} href="https://flowbite-react.com">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">minimal reading</span>
        </Navbar.Brand>
        <div className="flex">
            <SearchBar />
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
            
            <Navbar.Link href="#" active>
                Home
            </Navbar.Link>
            <Navbar.Link as={Link} href="#">
                About
            </Navbar.Link>
            </Navbar.Collapse>
      </Navbar>
    )
}

export default NavigationMenu