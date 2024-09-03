const QuestionsModel = require('../models/questions')
const Puppeter = require('puppeteer')

const Scrapper = () => {}

Scrapper.run = async function (pageNumber) {
    try {
        const currentData = await QuestionsModel.find()
        return (parseInt(pageNumber) + 2)
    } catch (e) {
        return null
    }
}

Scrapper.new = async function (question) {
    try {
        const currentData = await QuestionsModel.create({
            type: question.type,
            title: question.title,
            question: question.question,
            answers: question.answers,
            date: question.date,
            user_name: question.user_name,
            best_answer: question.best_answer,
            closed: question.closed,
            has_image: question.has_image
        })
        return currentData
    } catch (e) {
        return e.message
    }
}

module.exports = Scrapper