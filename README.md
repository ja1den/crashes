# Crash Data

> Database design task for Stage 2 Digital Technologies.

## Introduction

This app was built to store South Australian road crash data. The source data can be found [here](https://data.sa.gov.au/data/dataset/road-crash-data).

It reads from a [MySQL](https://www.mysql.com/) database, and is built with [React](https://reactjs.org/) and [Express](https://expressjs.com/).

## Usage

Run the [Create React App](https://create-react-app.dev/) development server.

```sh
npm start
```

Run the [Express](https://expressjs.com/) server.

```sh
npm run api
```

Lint the project.

```sh
npm run lint
```

Build the [Docker](https://www.docker.com/) image.

```sh
docker build . -t ja1den/crashes
```

## License

[MIT](LICENSE)
