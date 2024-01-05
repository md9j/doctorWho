# select baseimage
FROM node:18.17.1-alpine 

# set the working directory in the docker image
WORKDIR /usr/src/app

# copy package.json and package-lock.json to the docker image
COPY package.json ./
COPY package-lock.json ./

# install application dependencies in docker image
RUN npm ci

# copy the rest of the application to the docker image
COPY . .

# expose port 3000 in container for server to connect to container
EXPOSE 3000

# define run command
CMD [ "node", "docWhoIndex.js" ]