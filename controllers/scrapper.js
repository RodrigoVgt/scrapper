const QuestionsModel = require('../models/questions')
const puppeteer = require('puppeteer')

const Scrapper = () => {}

Scrapper.run = async function (pageNumber) {
    try {
        let created = 0
        let error = 0
        let pageError = 0
        const questionObj = []
        const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: false});
        const page = await browser.newPage();

        for(let i = 0; i < 4; i++){
            try {
                const searchPage = `https://oficinabrasil.com.br/forum?page=${i + parseInt(pageNumber)}`
                page.goto(searchPage, { waitUntil: 'load' })

                await page.waitForNavigation({ waitUntil: 'networkidle0' })

                const currentQuestions = await page.$x('/html/body/div[3]/div/div[2]/div[2]/div[2]/div/div[2]/div/div')

                for(const iterator of currentQuestions){
                    try{
                        const type = await this.getType(iterator)
                        const title = await this.getTitle(iterator)
                        const question = await this.getQuestion(iterator)
                        const date = await this.getDate(iterator)
                        const user_name = await this.getUserName(iterator)
                        const has_image = await this.getHasImage(iterator)
                        const answer =await this.getAnswer(iterator)
                        const best_answer = await this.getBestAnswer(iterator)
                        const closed = await this.getClosed(iterator)
                        if(!question || !answer || answer.length < 1) {
                            error++
                            continue
                        }
        
                        questionObj.push({
                            type, title, question, answer, date, user_name, best_answer, closed, has_image
                        })
                    } catch(e) {
                        console.log(e)
                        error++
                        continue
                    }
                }
            } catch (e) {
                pageError++
                console.log(e)
                continue
            }
        }

        questionObj.forEach(async (question) => {
            const result = await this.new(question)
            if(result) created++ 
            else error++
        })

        console.log("criados: " + created, "Erros: " + error, "Erro de página: " + pageError)
        await browser.close()
        return (parseInt(pageNumber) + 5)
    } catch (e) {
        await browser.close()
        return null
    }
}

Scrapper.getType = async function(page){
    try {
        const superiorText = await page.$eval('div div div.relative.bottom-8.-mb-8.flex.justify-end', element => element.innerText)
        return superiorText ? superiorText.trim().toLowerCase() : null
    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getTitle = async function(page){
    try {
        const text = await page.$eval('div div a div.px-5 h1', element => element.innerText)
        return text ? text.trim().toLowerCase() : null
    } catch (e) {
        console.log(e)
        return null
    }
}

Scrapper.getQuestion = async function(page){
    try {
        let text = await page.$$eval('div div a div.px-5 p', elements => {
            return elements.map(el => el.innerText.replace(/\n/g, ' ').trim()).join(' ')
          })
        return text && text.length > 0 ? text.trim().toLowerCase() : null
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
        const date = await page.$eval('div div div.flex.justify-between.px-8', element => element.innerText)
        return date ? stringToDate(date) : null
    } catch (e) {
        console.log(e)
        return new Date()
    }
}

Scrapper.getUserName = async function(page){
    try {
        const name = await page.$eval('div div a div.flex.items-center.gap-3 h2', element => element.innerText)
        return name ? name.trim().toLowerCase() : null
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
        const hasChildren = await page.$eval('div div a div:nth-child(4)', el => el.children.length > 0);
        return hasChildren
    } catch (e) {
        return false
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

function stringToDate(dateStr) {
    const parts = dateStr.split(" ");
    
    const months = {
        "janeiro": 0,
        "fevereiro": 1,
        "março": 2,
        "abril": 3,
        "maio": 4,
        "junho": 5,
        "julho": 6,
        "agosto": 7,
        "setembro": 8,
        "outubro": 9,
        "novembro": 10,
        "dezembro": 11
    };
    
    const day = parseInt(parts[0], 10)
    const month = months[parts[2].toLowerCase()]
    const year = parseInt(parts[4], 10).toString().slice(0, 4)

    return new Date(year, month, day)
}

module.exports = Scrapper