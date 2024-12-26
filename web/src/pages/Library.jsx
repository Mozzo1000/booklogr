import React from 'react'
import LibraryPane from '../components/Library/LibraryPane'
import WelcomeModal from '../components/WelcomeModal'
import AnimatedLayout from '../AnimatedLayout'

function Library() {
  return (
    <AnimatedLayout>
    <div className="container mx-auto ">
      <LibraryPane />
      <WelcomeModal />
    </div>
    </AnimatedLayout>
  )
}

export default Library