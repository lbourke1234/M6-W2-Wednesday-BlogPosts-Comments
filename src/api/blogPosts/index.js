import express from 'express'
import BlogPostsModel from './model.js'
import createError from 'http-errors'

const blogPostsRouter = express.Router()

blogPostsRouter.get('/', async (req, res, next) => {
  try {
    const blogPosts = await BlogPostsModel.find()
    res.send(blogPosts)
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      res.send(blog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.post('/', async (req, res, next) => {
  try {
    const newBlog = new BlogPostsModel(req.body)
    const { _id } = await newBlog.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.put('/:id', async (req, res, next) => {
  try {
    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deletedUser = await BlogPostsModel.findByIdAndDelete(req.params.id)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default blogPostsRouter
