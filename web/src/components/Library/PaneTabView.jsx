import React from 'react'

function PaneTabView({children, view, setView}) {
  return (
    <>
    {view === "gallery" &&
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {children}
      </div>
    }

    {view === "list" &&
      <div className="flex flex-col gap-4">
        {children}
      </div>
    }
    </>
  )
}

export default PaneTabView