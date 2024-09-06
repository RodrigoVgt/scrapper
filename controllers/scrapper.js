const QuestionsModel = require('../models/questions')
const puppeteer = require('puppeteer')

const Scrapper = () => {}

Scrapper.run = async function (pageNumber) {
    try {
        let created = 0
        let error = 0
        const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: false});
        const page = await browser.newPage();

        for(let i = 0; i < 5; i++){
            try {
                const searchPage = `https://oficinabrasil.com.br/forum?page=${i + parseInt(pageNumber)}`
                page.goto(searchPage)
                const type = await this.getType(searchPage)
                const title = await this.getTitle(searchPage)
                const question = await this.getQuestion(searchPage)
                const answer = await this.getAnswer(searchPage)
                const date = await this.getDate(searchPage)
                const user_name = await this.getUserName(searchPage)
                const best_answer = await this.getBestAnswer(searchPage)
                const closed = await this.getClosed(searchPage)
                const has_image = await this.getHasImage(searchPage)
                
                if(!question || !answer || answer.length < 1) {
                    error++
                    continue
                }

                const questionObj = {
                    type, title, question, answer, date, user_name, best_answer, closed, has_image
                }
                const result = await this.new(questionObj)
                if(result) {
                    created++ 
                    continue
                }
                error++
            } catch (e) {
                error++
                console.log(e)
                continue
            }
        }

        console.log("criados: " + created, "Erros: " + error)
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
        return []
    }
}

Scrapper.getDate = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return new Date()
    }
}

Scrapper.getUserName = async function(page){
    try {

    } catch (e) {
        console.log(e)
        return "Sem user"
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