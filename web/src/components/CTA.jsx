import { Button } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section>
        <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div class="grid grid-cols-1 content-center mx-auto max-w-screen-sm text-center">
                <h2 class="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900">Start tracking your books today</h2>
                <Button as={Link} to="/login">Get started!</Button>
            </div>
        </div>
    </section>
  )
}

export default CTA