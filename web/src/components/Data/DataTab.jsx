import React from 'react'
import FileList from './FileList'
import RequestData from './RequestData'

function DataTab() {
  return (
    <div>
        <div className="grid grid-rows-1 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            <div>
                <RequestData />
            </div>
            <div className="col-span-2">
                <FileList />
            </div>
        </div>
    

    </div>
  )
}

export default DataTab