const { GoogleGenerativeAI } = require("@google/generative-ai");

const TokenGenerator = () => {}

TokenGenerator.generate = async function(text){
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY)
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" })

        const result = await model.embedContent(text)
        return result.embedding
    } catch (err) {
        console.log(err)
        return []
    }
}

TokenGenerator.generateResponse = async function(message, question) {
    try {
        let instruction = ' Você vai receber uma pergunta com alguams respostas. Retorne somente a melhor resposta, adaptada para ser como se você estivesse em uma conversa técnica impessoal, sem explicações longas. Dê um peso maior às respostas marcadas com (**melhor resposta**)'
        const genAI = new GoogleGenerativeAI(process.env.API_KEY)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest", 
            systemInstruction: instruction
        })

        const text = await generateText(message, question)

        const result = await model.generateContent(text)

        return result.response.text()
    } catch (err) {
        console.log(err)
        return []
    }
}

async function generateText(message, question) {
    let text = message
    if(question.best_answer){
        let number = 0
        for(const iterator of question.answers){
            number++
            if(iterator.best_answer === true) {
                text += number + "(**melhor resposta**)" + iterator.answer + "\n"
                continue
            }
            text += number + ' - ' + iterator.answer +  "\n"
        }
    }
    if(!question.best_answer){
        let number = 0
        for(const iterator of question.answers){
            number++
            text += number + iterator.answer +  "\n"
        }
    }
    return text
}

module.exports = TokenGenerator