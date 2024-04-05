import { Avatar, Dropdown, Navbar, Button } from 'flowbite-react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

function NavigationMenu() {
    return (
        <Navbar border>
        <Navbar.Brand as={Link} href="/">
            <img src="/icon.svg" className="mr-3 h-6 sm:h-8" alt="Logo" />
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">minimal reading</span>
        </Navbar.Brand>
        <div className="flex">
            <SearchBar />
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
            
            <Navbar.Link href="/" active={location.pathname == "/"}>
                Home
            </Navbar.Link>
            <Navbar.Link as={Link} href="/about" active={location.pathname == "/about"}>
                About
            </Navbar.Link>
            </Navbar.Collapse>
      </Navbar>
    )
}

export default NavigationMenu