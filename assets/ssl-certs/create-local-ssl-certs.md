openssl req -new -newkey rsa:2048 -nodes -keyout web-starter.key -out web-starter.csr -config openssl.cnf
openssl x509 -req -in web-starter.csr -signkey web-starter.key -out web-starter.crt -days 365 -extfile openssl.cnf -extensions v3_req
