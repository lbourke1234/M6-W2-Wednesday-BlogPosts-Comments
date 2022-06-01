import mongoose from 'mongoose'
import express from 'express'
import cors from 'cors'
import {
  notFoundHandler,
  genericHandler,
  badRequestHandler
} from './errorHandlers.js'
import blogPostsRouter from './api/blogPosts/index.js'
import listEndpoints from 'express-list-endpoints'

const server = express()
const port = process.env.PORT || 5001

server.use(cors())
server.use(express.json())

server.use('/blogPosts', blogPostsRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericHandler)

mongoose.connect(process.env.MONGO_CONNECTION_STRING)

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to Mongo!')
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
  })
})
