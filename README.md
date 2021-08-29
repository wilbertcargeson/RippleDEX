# RippleDEX CRM

Hey team! Gio here. This repo might be confusing if you're not experienced since it uses Gatsby for the build and deploy workflow. I'll get you up to speed on how you can get the web app running on your localhost!

## Getting Started

Here's what you need to do to get this repo running on your local machine:

1. clone this repo to your device.
2. run `npm install`, assuming you have node installed on your device.
3. once you have the dependancies installed, you'll need to download the enviornment files `.env.development` and
   `firebase.json` from our team Google Drive. These contain the credentials to allow the app to access the database from your local device.
4. after all that, simply run `npm start`, wait a bit, then you should be able to access the web app at localhost:8000. Happy coding!

## For Frontend

If you're on the front-end team, the folders you'll mostly be working in are `/components` and `/pages`. Pages are dynamically generated using Gatsby and GraphQL, so the actual coding is for the React templates that use the data from graphQL. Another thing to mention is that this project uses Sass instead of plain CSS. More info coming soon.

## For Backend

The back-end team mostly works in the `/models` folder, where functions to create, access and modify data objects are written. Since we're using Gatsby, our data pipeline is supplemented by GraphQL, which makes accessing the data pretty easy. For accessing data, we will mostly be writing GraphQL queries to access different levels of data for different use cases. If you would like a demo of these GraphQL queries, you can see them at [localhost:8000/\_\_\_graphql](localhost:8000/___graphql). Besides that, we will also be focused on writing the functions to create and modify data. There will be a specific format to writing these functions and the tests associated with them. More info on this coming soon.
