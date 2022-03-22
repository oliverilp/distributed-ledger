# stage 1, building
FROM node:lts-alpine as builder

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./

COPY . .
RUN npm install
RUN npm run build

# stage 2, where the app actually runs 
FROM node:lts-alpine

WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /usr/app/dist ./dist

EXPOSE 10000
CMD [ "npm", "run", "start" ]