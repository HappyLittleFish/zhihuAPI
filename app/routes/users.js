const jwt = require('koa-jwt')
const { secret } = require('../config')
const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find,
  findById,
  create,
  update,
  delete: del,
  login,
  checkOwner,
  listFollowing,
  listFollowers,
  checkUserExist,
  follow,
  unfollow,
  followTopic,
  unfollowTopic,
  listFollowingTopics,
  listQuestions,
  listFollowingQuestions,
  followQuestion,
  unfollowQuestion,
  listLikingAnswers,
  listDislikingAnswers,
  likeAnswer,
  dislikeAnswer,
  unlikeAnswer,
  undislikeAnswer,
  listCollectingAnswers,
  collectAnswer,
  uncollectAnswer,
} = require('../controllers/users')

const { checkTopicExist } = require('../controllers/topics')
const { checkQuestionExist } = require('../controllers/questions')
const { checkAnswerExist } = require('../controllers/answers')

const auth = jwt({ secret })
// 使用jsonwebtoken验证token
// async (ctx, next) => {
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace('Bearer ', '')
//   console.log(token)
//   try {
//     const user = jsonwebtoken.verify(token, secret)
//     ctx.state.user = user
//   } catch (err) {
//     ctx.throw(401, err.message)
//   }
//   await next()
// }

router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, del)
router.post('/login', login)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.get('/:id/followingTopics', listFollowingTopics)
router.get('/:id/followingQuestions', listFollowingQuestions)
router.get('/:id/questions', listQuestions)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)
router.put('/followingQuestions/:id', auth, checkQuestionExist, followQuestion)
router.delete(
  '/followingQuestions/:id',
  auth,
  checkQuestionExist,
  unfollowQuestion
)
router.put(
  '/likingAnswers/:id',
  auth,
  checkAnswerExist,
  likeAnswer,
  undislikeAnswer
)
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
router.get('/:id/likingAnswers', listLikingAnswers)
router.put(
  '/dislikingAnswers/:id',
  auth,
  checkAnswerExist,
  dislikeAnswer,
  unlikeAnswer
)
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)
router.get('/:id/dislikingAnswers', listDislikingAnswers)
router.get('/:id/listCollectingAnswers', listCollectingAnswers)
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router
