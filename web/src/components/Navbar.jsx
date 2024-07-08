import React from 'react';
import { Navbar } from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom';

const customThemeNav = {
  root: {
    base: "bg-[#FDFCF7] px-2 py-2.5 dark:border-gray-700 dark:bg-gray-800 sm:px-4",
  },
  link: {
    active: {
      on: "bg-cyan-700 underline text-white dark:text-white md:bg-transparent md:text-cyan-700"
    }
  }
};

function NavigationMenu() {
    let location = useLocation();

    return (
        <>
          <div className="pb-10">
          <Navbar theme={customThemeNav}>
            <Navbar.Brand as={Link} to="/">
              <img src="/icon.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">BookLogr</span>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              {import.meta.env.VITE_DISABLE_HOMEPAGE === "false" &&
                <Navbar.Link as={Link} to="/" active={location.pathname == "/"}>
                  Home
                </Navbar.Link>
              }
              <Navbar.Link as={Link} to="/login" active={location.pathname == "/login"}>
                Login
              </Navbar.Link>
              <Navbar.Link as={Link} to="/register" active={location.pathname == "/register"}>
                Register
              </Navbar.Link>
            </Navbar.Collapse>
          </Navbar>
          </div>
        </>
    )
}

export default NavigationMenu