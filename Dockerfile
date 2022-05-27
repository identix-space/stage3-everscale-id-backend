FROM node:14 AS modules

WORKDIR /app

COPY ./package*.json ./
RUN npm i
FROM modules AS app

WORKDIR /app

COPY . .

RUN npm run prisma:gen

EXPOSE 3000

CMD ["/app/run.sh"]
