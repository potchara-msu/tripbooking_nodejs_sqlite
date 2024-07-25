FROM node
WORKDIR /app
COPY . .
RUN npm init -y
RUN npm install express sqlite3
EXPOSE 3000
CMD ["node","server.js"]