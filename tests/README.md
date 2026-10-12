Run the regression suite with the project's Python dependencies installed:

```sh
python -m unittest discover -s tests -v
# Alternatively:
python -m pytest tests
```

Tests use temporary file-backed SQLite databases and real threads. To run against
PostgreSQL, set `BOOKLOGR_TEST_DATABASE_URL` to a **dedicated disposable test
database**; the suite creates and drops tables in that database.
No production configuration or credentials are required.

The task migration test upgrades the complete migration chain, checks existing
`fresh`, `started`, and `success` records, downgrades the new migration, and
upgrades again. No additional testing dependencies are needed.

REL-01 investigation and intentional limits:

- Export requests and Mastodon book-status changes create tasks via `_create_task`.
  `GET /v1/tasks/<id>` queries owned tasks; retry also checks ownership. The task
  CLI only queries or clears queued tasks. No background-task tests existed on
  upstream at the time of this change.
- Previously an exception left `started` persisted, potentially left the session
  requiring rollback, and skipped context teardown. Unsupported types fell
  through to success. Retry executed synchronously in a separately pushed context
  and did not commit its reset. This change preserves synchronous retry and its
  response, but rejects queued/running tasks with HTTP 409.
- The model had no failure field or failure-recording convention. The optional
  `error_message` gives the status API and export screen a safe failure description.
  Existing schema fields remain; the new nullable field is additive. Full
  tracebacks are logged through Flask's logger with `task_id` metadata; exception
  text is never copied into the database or API diagnostics.
- The export UI previously watched only the file list and waited forever on
  failure. It now checks task status, shows failures, and stops its spinner and
  polling at either terminal status. Browser smoke checks verified both outcomes.
- Abrupt process termination, thread-start failure, or a database outage that
  prevents recording failure can still leave a task queued/running. Stale running
  tasks require manual intervention; this PR adds no recovery jobs or scheduling.
- File writes and Mastodon posts cannot be rolled back with the task transaction.
  Partial/orphan export files can remain, and retry after a completed external
  side effect can repeat it. Atomic file publication and external idempotency
  remain outside REL-01. Existing export formats, names, and posting behavior
  are unchanged.
- The existing task migration uses a `now()` server default not implemented by
  SQLite. Application-created rows supply a timestamp; migration tests also
  supply one explicitly. Repairing this pre-existing default is outside scope.

Deploy the API and frontend together and apply migration `d73e9b821a04` before
starting the new API code:

```sh
python -m flask --app api.app db upgrade
```

The existing container entrypoint already runs `flask db upgrade`. The migration
adds only nullable `tasks.error_message VARCHAR(255)`; existing rows receive
`NULL`. The status column is already an unconstrained string, so `failed` needs
no enum or data migration. Downgrade removes only the diagnostic column.
