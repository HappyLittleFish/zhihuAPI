const Comment = require('../models/comments')
const { Schema } = require('mongoose')

class CommentsCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params
    const { rootCommentId } = ctx.query
    ctx.body = await Comment.find({
      content: q,
      questionId,
      answerId,
      rootCommentId,
    })
      .limit(perPage)
      .skip(page * perPage)
      .populate('commentator replyTo')
  }
  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields
      .split(';')
      .filter((f) => f)
      .map((f) => ' +' + f)
      .join('')
    const comment = await Comment.findById(
      ctx.params.id,
      selectFields
    ).populate('commentator replyTo')
    ctx.body = comment
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    })
    const { questionId, answerId } = ctx.params
    const comment = await new Comment({
      ...ctx.request.body,
      questionId,
      answerId,
      commentator: ctx.state.user._id,
    }).save()
    ctx.body = comment
  }
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id, '+commentator')
    if (!comment) {
      ctx.throw(404, '评论不存在')
    }
    if (comment.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }
    if (comment.answerId !== ctx.params.answerId) {
      ctx.throw(404, '该答案下没有此评论')
    }
    ctx.state.comment = comment
    await next()
  }
  async checkCommentator(ctx, next) {
    if (ctx.state.user._id !== ctx.state.comment.commentator.toString()) {
      ctx.throw(403, '没有操作权限')
    }
    await next()
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
    })
    const { content } = ctx.request.body
    const comment = await ctx.state.comment.update({ content })
    ctx.body = comment
  }
  async delete(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new CommentsCtl()
