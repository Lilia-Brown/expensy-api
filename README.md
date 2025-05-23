# Expensy API App

WIP as of 05/22/25

## Description

This project sets up an API for an application that helps users manage expenses across multiple cities. Users can log individual expenses, categorize them for better tracking, and set budget limits. The app monitors spending and alerts users when they're approaching or exceeding their budget, making it easier to stay financially on track.

## Requirements

- Node.js (v18 or higher recommended) – [Download here](https://nodejs.org/en)
- npm (comes with Node.js) or yarn
- PostgreSQL (or your preferred database, configured in .env)
- Prisma CLI – installed via `npm install prisma --save-dev`

## Getting Started

- Clone this repository and cd into the directory
  ```
  git clone https://github.com/Lilia-Brown/expensy-api
  cd expenses-api
  ```

- Install dependencies
  ```
  npm install
  ```

- Set up environment variables
  - Create an `.env` file at the root of the project and add your database URL:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    ```

- Set up the database
  ```
  npx prisma migrate dev --name init
  ```

- Start the server
  ```
  node index.js
  ```

## Authors

[Lily Brown](https://tinyurl.com/lilia-brown): https://www.linkedin.com/in/lilia-brown/
