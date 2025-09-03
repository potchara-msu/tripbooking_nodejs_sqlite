=== INSTALL DEPENDENCIES ===
npm init -y
npm install express sqlite3

=== RUN ===
node server.js


=== Docker ===
docker build . -t tripbooking
docker run -d --name tripbooking -p 8888:3000  tripbooking