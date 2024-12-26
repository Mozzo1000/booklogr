# Workers
This folder contains all code for the import workers and other background tasks that integrate with BookLogr.

See the wiki article on [Background tasks](https://github.com/Mozzo1000/booklogr/wiki/Background-tasks) for more information.

# Management CLI
The `manage.py` script have two functions, one being it starts the event listener and will select the most appropriate worker for the event. And two, gives the administrator options to clear the queue and process backlogs.

## Start listener
Run `manage.py listen` to start the worker listener.

*NOTE: currently the listener is single-threaded so when it catches an event it will block until the worker has completed it's task. Multithreading will be added in the future.*

## List queue
Run `manage.py queue` to list all current tasks in queue.

## Clear queue
Run `manage.py clear` to clear the queue of any tasks that have not started any processing.

## Run backlog tasks
In the event of the listener not picking up on tasks in time you can manually run all tasks that are backlogged.

Run `manage.py backlog` to start processing the backlog. 