import React from 'react'

function FeatureSection() {
  return (
    <section className="bg-[#0891B2]">
      <div class="grid grid-cols-1 md:grid-cols-2 max-w-screen-xl py-8 mx-auto gap-12 lg:grid-cols-12">
          {/* First section */}
          <div class="lg:mt-0 lg:col-span-5 order-1 p-4">
              <img src="/feature_section_01.png" alt="Library picture"/>
          </div>
          <div class="place-self-center lg:col-span-7 order-2 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Build your virtual library</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">Add your books to lists depending on if you have <strong>read</strong> them, are 
              <strong> currently reading</strong> or <strong>want to read</strong>.</p>
          </div>

          {/* Second section */}
          <div class="place-self-center lg:col-span-7 order-4 lg:order-3 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Share your reading list</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">Let your friends see what kind of exciting book you are currently reading and have read in the past</p>
          </div>
          <div class="lg:mt-0 lg:col-span-5 order-3 lg:order-4 p-4">
              <img src="/feature_section_02.png" alt="Library picture"/>
          </div>

          {/* Third section */}
          <div class="lg:mt-0 lg:col-span-5 order-5 p-4">
              <img src="/feature_section_03.png" alt="Library picture"/>
          </div>
          <div class="place-self-center lg:col-span-7 order-6 p-4 md:p-0">
              <h2 class="text-white max-w-2xl mb-4 text-4xl font-semibold tracking-tight leading-none md:text-4xl xl:text-5xl">Look up your favorite book with ease</h2>
              <p class="max-w-2xl mb-6 text-white lg:mb-8 md:text-md lg:text-lg">With search and catalog powered by <a className="link" href="https://openlibrary.org" target="_blank">OpenLibrary</a>, there are millions of books in our catalog with more added each day.</p>
          </div>
      </div>
    </section>
  )
}

export default FeatureSection