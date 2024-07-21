import React from 'react'
import LibraryPane from '../components/Library/LibraryPane'
import WelcomeModal from '../components/WelcomeModal'

function Library() {
  return (
    <div className="container mx-auto ">
      <LibraryPane />
      <WelcomeModal />
    </div>
  )
}

export default Library