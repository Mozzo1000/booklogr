import React from 'react';
import { Navbar, NavbarBrand, NavbarToggle, NavbarCollapse, NavbarLink } from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom';

const customThemeNav = {
  root: {
    base: "bg-[#FDFCF7] dark:bg-[#121212] px-2 py-2.5 dark:border-gray-700 dark:bg-gray-800 sm:px-4",
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
            <NavbarBrand as={Link} to="/">
              <img src="/icon.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">BookLogr</span>
            </NavbarBrand>
            <NavbarToggle />
            <NavbarCollapse>
              {import.meta.env.VITE_DISABLE_HOMEPAGE === "false" &&
                <NavbarLink as={Link} to="/" active={location.pathname == "/"}>
                  Home
                </NavbarLink>
              }
              <NavbarLink as={Link} to="/login" active={location.pathname == "/login"}>
                Login
              </NavbarLink>
              <NavbarLink as={Link} to="/register" active={location.pathname == "/register"}>
                Register
              </NavbarLink>
            </NavbarCollapse>
          </Navbar>
          </div>
        </>
    )
}

export default NavigationMenu