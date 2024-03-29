import React from 'react'

function PaneTabView(props) {
  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
      {props.children}
    </div>
  )
}

export default PaneTabView