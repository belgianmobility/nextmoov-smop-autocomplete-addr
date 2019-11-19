FROM node:12-alpine

COPY ./ /app

WORKDIR /app
RUN yarn


EXPOSE 80

WORKDIR /app
CMD [ "yarn", "start" ]
