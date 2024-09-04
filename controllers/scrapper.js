const QuestionsModel = require('../models/questions')
const Puppeter = require('puppeteer')

const Scrapper = () => {}

Scrapper.run = async function (pageNumber) {
    try {
        
        return (parseInt(pageNumber) + 5)
    } catch (e) {
        return null
    }
}

Scrapper.getType = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getTitle = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getQuestion = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getAnswer = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getDate = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getUserName = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getBestAnswer = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getClosed = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getHasImage = async function(page){
    try {

    } catch (e) {
        console.log(e)
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