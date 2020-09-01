FROM node:13
WORKDIR /home/node/app
COPY app /home/node/app
RUN npm install

RUN npm install -g nodemon
CMD nodemon run app

