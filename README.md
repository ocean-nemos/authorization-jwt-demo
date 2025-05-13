# authorization-jwt-demo
Demo project with 2 servers to test JWT authorization methods, perfect to get started with creating auth apis. This project skips authentication, check the other repo for this. 

## 0. tech stack

- Node.js
- Express api
- Nodemon
- jsonwebtoken (jwt)

## 1. create jwt secret

Crate a .env file, and run the following command to create the jwt secret on a console:

```bash
node
require('crypto').randomBytes(64).toString('hex')
```

Save the results inside the .env file, make sure to run it twice:

```bash
JWT_SECRET = output1
REFRESH_JWT_SECRET = output2
```