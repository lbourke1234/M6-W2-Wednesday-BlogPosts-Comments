import express from 'express'
import BlogPostsModel from './model.js'
import CommentsModel from '../blogPosts/model.js'
import createError from 'http-errors'
import q2m from 'query-to-mongo'

const blogPostsRouter = express.Router()

blogPostsRouter.get('/', async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const total = await BlogPostsModel.countDocuments(mongoQuery.criteria)
    const blogs = await BlogPostsModel.find(
      mongoQuery.critera,
      mongoQuery.options.fields
    )
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort)
    res.send({
      links: mongoQuery.links('http://localhost:5001/blogPosts', total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs
    })

    // const blogPosts = await BlogPostsModel.find()
    // res.send(blogPosts)
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

blogPostsRouter.post('/:id', async (req, res, next) => {
  try {
    const newComment = { ...req.body, createdAt: new Date() }

    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: newComment } },
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

blogPostsRouter.get('/:id/comments', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      res.send(blog.comments)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      const comment = blog.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (comment) {
        res.send(comment)
      } else {
        next(
          createError(
            404,
            `Comment with Id: ${req.params.commentId} not found!`
          )
        )
      }
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.put('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      const index = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (index !== -1) {
        const updatedComment = {
          ...blog.comments[index],
          ...req.body
        }
        blog.comments[index] = updatedComment

        await blog.save()
        res.send(blog)
      }
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
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

export default blogPostsRouter
