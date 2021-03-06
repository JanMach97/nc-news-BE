const {Topic, Article, User, Comment} = require('../models');

const getAllTopics = (req, res, next) => {
  Topic.find()
    .then(topics => {
      if(topics.length === 0) throw {status: 404, msg: 'No topics found'}
      res.status(200).send({topics});
    })
    .catch(next);
};

const getArticlesByTopic = (req, res, next) => {
  const { topic_slug } = req.params
  Promise.all([Article.find({ topic: topic_slug }).populate('created_by'), Comment.find()])
    .then(([articlesWoComments, comments]) => {
      if (articlesWoComments.length === 0) throw { status: 404, msg: `articles for ${topic_slug} topic not found`}
      articles = articlesWoComments.map(article => {
        return {
          ...article.toObject(),
          comments: comments.filter(comment => `${comment.belongs_to}` === `${article._id}`).length
        }
      })
      res.status(200).send({articles});
    })
    .catch(next)
}

const addArticleToTopic = (req, res, next) => {
  const {title, body, created_by} = req.body;

  User.findOne({_id: created_by})
    .then(user => {
      if(!user) throw {status: 404, msg: 'User does not exists'}
      return Article.create({ title, body, created_by, topic: req.params.topic_slug, belongs_to: user.username})
    })
    .then(article => {
      res.status(201).send({article})
    })
    .catch(next);
};

module.exports = { getAllTopics, getArticlesByTopic, addArticleToTopic}