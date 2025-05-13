// setup dotenv .env vars
import dotenv from 'dotenv'
dotenv.config()

// import required libs 
import express from 'express'
import jwt from 'jsonwebtoken'

// init app
const app = express()
app.use(express.json())

// load secrets
const jwtSecret = process.env.JWT_SECRET
const refreshJwtSecret = process.env.REFRESH_JWT_SECRET

// Refresh tokens storage

// usually this would be stored on a DB like redis cache but for demo purposes we will store it on the server memory which should not be done, because they get deleted after something happens to the machine or to the process (it gets killed)

let refreshTokens = []

// Routes

app.post("/refresh/token", (req, res) => {
    const refreshToken = req.body.refreshToken

    // if not token found ret 401 unauthorized
    if (refreshToken == null) return res.sendStatus(401)

    // verify that the token is on the list
    const isFound = refreshTokens.includes(refreshToken)
    if (!isFound) return res.sendStatus(403)

    // verify jwt token with the respective refresh secret payload back
    jwt.verify(refreshToken, refreshJwtSecret, (err, user) => {

        // IMPORTANT READ: if you pass (err, payload) and try to create the token with that payload variable you will get error verifying that new token with jwt, instead manually parse all the things of the original payload and give it an adecuate name, like here with user.

        if (err) return res.sendStatus(403) // forbidden

        // create new access token
        const newPayload = {
            username: user.username
        }
        const accessToken = generateToken(newPayload, jwtSecret, false)

        // return res
        res.json({
            newAccessToken: accessToken
        })
    })

})

app.delete("/logout", (req, res) => {
    // remove the refresh token from the DB, in this case remove it from the refreshTokens list
    const userRefreshToken = req.body.refreshToken

    if (userRefreshToken == null) return res.sendStatus(401) // refresh token mission from body

    // remove token from list
    const beforeRemoval = refreshTokens.length
    refreshTokens = refreshTokens.filter(token => token !== userRefreshToken)
    const afterRemoval = refreshTokens.length
    console.log("before: ", beforeRemoval, " | after: ", afterRemoval)

    res.sendStatus(204) // deleted succesfully
})

app.post("/login", (req, res) => {

    // authenticate user
    const username = req.body.username
    // ~ ~ skipped the rest
    // end authentication

    const payload = {
        "username": username
    }

    // sign tokens
    const accessToken = generateToken(payload, jwtSecret, false)
    const refreshToken = generateToken(payload, refreshJwtSecret, true)

    // store refresh token
    refreshTokens.push(refreshToken)
    console.log("refresh tokens: ", refreshTokens)

    // response
    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    })
})

// Functions

export function authenticateToken(req, res, next) {
    // adds a user object to the request, which contains whatever the token creation includes
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) return res.sendStatus(401) // forbidden
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403) // unauthorized error

        // no error on the next code block
        req.user = user
        next()
    })
}

export function generateToken(payload, secret, isRefresh) {

    if (!isRefresh) {
        // token not for refresh
        return jwt.sign(payload, secret, {
            expiresIn: '35s' // usually is 15 o 10 minutes ('15m') but for testing purposes here it is as 15s
        })
    } else {
        // token for refresh

        // we do not add a expiration date, instead we manage it manually
        return jwt.sign(payload, secret)
    } 
}

// Export JWT secret for use in other modules if needed
export { jwtSecret }

// Only start the server if this file is being run directly
if (import.meta.url.endsWith(process.argv[1].substring(process.argv[1].indexOf('/')))) {
    app.listen(4000, () => console.log('Auth server running on port 4000'))
}