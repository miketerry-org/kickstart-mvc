openssl req -new -newkey rsa:2048 -nodes -keyout kickstart-mvc.key -out kickstart-mvc.csr -config openssl.cnf
openssl x509 -req -in kickstart-mvc.csr -signkey kickstart-mvc.key -out kickstart-mvc.crt -days 365 -extfile openssl.cnf -extensions v3_req
