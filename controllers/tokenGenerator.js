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

module.exports = TokenGenerator