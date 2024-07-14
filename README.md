<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Mozzo1000/booklogr">
    <img src="assets/logo.svg" height="120px" width="120px"/>
  </a>

<h3 align="center">BookLogr</h3>

  <p align="center">
    A simple, self-hosted service to keep track of your personal library.
    <br />
    <a href="https://github.com/Mozzo1000/booklogr/wiki"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href=""><s>View Demo</s></a>
    <a href="https://github.com/Mozzo1000/booklogr/issues">Report Bug</a>
    <a href="https://github.com/Mozzo1000/booklogr/issues">Request Feature</a>
  </p>
</div>

## About the project

## Features

## Development
### Dependencies
* Python
* NodeJS

### Instructions
* Copy `.env.example` file and rename it to  `.env`
* Edit `.env` file as necessary
* Run `docker compose up`
  * This will start up the authentication server API and databse as well as a database for booklogr itself.
* Install poetry with `python -m pip install poetry
* Run `poetry install` to install python dependencies
* Run `poetry run flask upgrade` to run migration scripts to booklogr database.
* Run `poetry run flask run` to start booklogr API
* Run `cd web` and `npm run dev` to start frontend

## Contributing
All contributions are welcome!

## License