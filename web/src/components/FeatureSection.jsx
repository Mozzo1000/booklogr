import React from 'react'
import { RiOpenSourceLine } from "react-icons/ri";
import { RiServerLine } from "react-icons/ri";
function FeatureSection() {
  return (
    <>
    {/* First section */}
    <section className="bg-[#0891B2]">
      <div class="grid grid-cols-1 md:grid-cols-2 max-w-(--breakpoint-xl) py-8 mx-auto gap-12 lg:grid-cols-12">
          {/* First feature */}
          <div class="lg:mt-0 lg:col-span-5 order-1 p-4">
              <img src="/feature_section_01.png" alt="Library picture" className="shadow-2xl"/>
          </div>
          <div class="place-self-center lg:col-span-7 order-2 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Build your virtual library</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">Add your books to lists depending on if you have <strong>read</strong> them, are 
              <strong> currently reading</strong> or <strong>want to read</strong>.</p>
          </div>

          {/* Second feature */}
          <div class="place-self-center lg:col-span-7 order-4 lg:order-3 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Share your reading list</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">Let your friends see what kind of exciting book you are currently reading and have read in the past</p>
          </div>
          <div class="lg:mt-0 lg:col-span-5 order-3 lg:order-4 p-4">
              <img src="/feature_section_02.png" alt="Library picture" className="shadow-2xl"/>
          </div>

          {/* Third feature */}
          <div class="lg:mt-0 lg:col-span-5 order-5 p-4">
              <img src="/feature_section_03.png" alt="Library picture" className="shadow-2xl"/>
          </div>
          <div class="place-self-center lg:col-span-7 order-6 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Look up your favorite book with ease</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">With search and catalog powered by <a className="link" href="https://openlibrary.org" target="_blank">OpenLibrary</a>, there are millions of books to look up with more added each day.</p>
          </div>
      </div>
    </section>


    {/* Second section */}
    <section className="bg-[#08B27E] text-center md:bg-size-[100%] bg-no-repeat bg-top bg-wave-02-pattern ">
      <div class="grid grid-cols-1 lg:grid-cols-2 max-w-(--breakpoint-xl) h-screen mx-auto gap-12 justify-center items-center">
        <div>
            <div class="flex justify-center mb-2">
                    <RiOpenSourceLine className="text-white h-12 w-12" />
            </div>
            <h3 class="mb-2 text-xl font-bold text-white">Open Source</h3>
            <p class="text-white">All code is fully open source and available on <a href="https://github.com/Mozzo1000/minimal-reading" target='_blank'>Github</a></p>
        </div>

        <div>
            <div class="flex justify-center mb-2">
                    <RiServerLine className="text-white h-12 w-12" />
            </div>
            <h3 class="mb-2 text-xl font-bold text-white">Self-hosted by design</h3>
            <p class="text-white">Run BookLogr on your own hardware and have complete control over your data</p>
        </div>     
      </div>
    </section>
    </>
  )
}

export default FeatureSection