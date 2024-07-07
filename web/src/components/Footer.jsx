import React from 'react'
import { Footer as FFooter } from 'flowbite-react';

function Footer() {
  return (
    <FFooter container className="bg-transparent sticky top-[100vh] z-10 border-none shadow-none ">
      <FFooter.Copyright href="https://andreasbackstrom.se" by="Andreas Backström" year={2024} />
    </FFooter>
  )
}

export default Footer