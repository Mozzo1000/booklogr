import React from 'react'
import LibraryPane from '../components/Library/LibraryPane'
import WelcomeModal from '../components/WelcomeModal'
import AnimatedLayout from '../AnimatedLayout'

function Library() {
  return (
    <AnimatedLayout>
    <div className="container mx-auto pb-15 md:pb-0">
      <LibraryPane />
      <WelcomeModal />
    </div>
    </AnimatedLayout>
  )
}

export default Library