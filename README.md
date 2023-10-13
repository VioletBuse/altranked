# Altranked

## Description

Altranked is an idle game I decided to build while I was on
a loss streak in Valorant. I wanted to build something that
would let me rank up without having to play the game.

## Technologies

This project was built using the following technologies:
* [React + Vite](https://vitejs.dev/)
* [Cloudflare Workers](https://workers.cloudflare.com/)
* [TailwindCSS](https://tailwindcss.com/)
* [Trpc](https://trpc.io/)
* [Drizzle-ORM](https://orm.drizzle.team/)

## Development

To run this project locally, you will need to have the following
installed:

* [Node.js](https://nodejs.org/en/)
* [Npm](https://www.npmjs.com/)
* [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

To start the api server, run the following commands:

```bash
npm run up:dev
npm run api
```

To start the frontend, run the following commands:

```bash
npm run web
```

## Deployment

To deploy this project, you will need to have the following

* [Cloudflare Account](https://dash.cloudflare.com/sign-up)
* [A Cloudflare D1 Database](https://developers.cloudflare.com/d1/)
* [A Domain](https://www.cloudflare.com/products/registrar/)

First, you have to modify the `wrangler.toml` file to include
your d1 database credentials, as well as the .env.production file to
your domain. Then, you must run the frontend build
command `npm run build`. You will have to create a cloudflare pages site
and manually upload the `dist` folder to the site. Finally you can
deploy the api with `npm run deploy:api`.

Following deployments can just be run with `npm run deploy`
