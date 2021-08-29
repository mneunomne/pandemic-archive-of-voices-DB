const openssl = require('openssl-nodejs')

openssl('openssl req -nodes -new -x509 -keyout server.key -out server.cert')
