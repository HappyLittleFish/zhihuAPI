const Answer = require('../models/answers')
const { Schema } = require('mongoose')

class AnswersCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Answer.find({
      content: q,
      questionId: ctx.params.questionId,
    })
      .limit(perPage)
      .skip(page * perPage)
  }
  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields
      .split(';')
      .filter((f) => f)
      .map((f) => ' +' + f)
      .join('')
    const answer = await Answer.findById(ctx.params.id, selectFields).populate(
      'answerer'
    )
    ctx.body = answer
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: true },
      content: { type: 'string', required: true },
    })
    console.log('questionId', ctx.params.questionId)
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId,
    }).save()
    ctx.body = answer
  }
  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById(ctx.params.id, '+answerer')
    if (!answer) {
      ctx.throw(404, '答案不存在')
    }
    if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此答案')
    }
    ctx.state.answer = answer
    await next()
  }
  async checkAnswerer(ctx, next) {
    if (ctx.state.user._id !== ctx.state.answer.answerer.toString()) {
      ctx.throw(403, '没有操作权限')
    }
    await next()
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
    })
    const answer = await ctx.state.answer.update(ctx.request.body)
    ctx.body = answer
  }
  async delete(ctx) {
    await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new AnswersCtl()
