FROM node:12.18.1
ARG runCommand="start:prod"
ENV RUNCOMMAND=$runCommand
RUN npm install pm2 -g
WORKDIR /home/node/app
COPY / /home/node/app
RUN npm install
EXPOSE 27017
EXPOSE 7002
RUN echo "$RUNCOMMAND"
ENTRYPOINT ["sh", "-c", "npm run $RUNCOMMAND"]