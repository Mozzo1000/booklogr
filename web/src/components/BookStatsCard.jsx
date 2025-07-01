import React from 'react'

function BookStatsCard(props) {
  return (
    <div className="flex flex-col gap-2 items-center">
        <div>
            {props.icon}
        </div>
        <div className="format lg:format-lg dark:format-invert pt-2">
            <h3>{props.number}</h3>
        </div>
        <div className="format lg:format-lg dark:format-invert">
            <p>{props.text}</p>
        </div>
    </div>
  )
}

export default BookStatsCard