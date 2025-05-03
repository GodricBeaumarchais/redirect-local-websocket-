FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3328
CMD ["node", "server.js"]
