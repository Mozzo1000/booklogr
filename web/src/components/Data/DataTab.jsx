import React from 'react'
import FileList from './FileList'

function DataTab() {
  return (
    <div>DataTab
        <div className="grid grid-cols-2 grid-rows-1 gap-4">
            <div >1</div>
            <div >
                <FileList />
            </div>
        </div>
    

    </div>
  )
}

export default DataTab