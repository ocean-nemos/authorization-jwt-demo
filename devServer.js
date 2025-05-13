// import required libs 
import express from 'express'
import { authenticateToken } from './authServer.js'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load JSON data
const posts = JSON.parse(
  await readFile(join(__dirname, './posts.json'), 'utf8')
)

// init app
const app = express()
app.use(express.json())

// Routes

app.get("/users/posts", middleware, (req, res) => {
    res.json(posts)
})

app.get("/user/posts", middleware, (req, res) => {

    // get payload object that auth middleware added from the jwt payload
    const user = req.user

    // extract necessary information
    const username = user.username

    // execute a response with filtered data for the user in specific
    const userPosts = posts[username] || []
    res.json(userPosts)
})

// Functions

function middleware(req, res, next) {

    // 1. authorization middleware
    authenticateToken(req, res, next)

    // 2. other middleware, any
    // none.

}


// Initialize
    
app.listen(3000, () => console.log('Dev server running on port 3000'))