const express = require('express');
const cors = require("cors");

const app = express();

const Scrapper = require('./controllers/scrapper');
const TokenGenerator = require('./controllers/tokenGenerator')
const MilvusController = require('./controllers/milvusController')

const QuestionsModel = require('./models/questions')
const Tokens = require('./models/tokens')
const TokensNB = require('./models/tokensnb')


const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.get('/teste', async (req, res) => {
    try {
        const result = await Scrapper.run(355)
        return result.status(200).send(result)
    } catch (err) {
        return res.status(500).send(err)
    }
})

// schedule.scheduleJob('*/2 * * * *', async () => {
//     try {
//         const page = await PageControll.findOne({current: true})
//         const result = await Scrapper.run(page.last_page)
//         await PageControll.updateOne({_id: page._id}, {$set: {last_page: result}})
//         return console.log("Roudou até a página: " + result)
//     } catch (err) {
//         console.error(err)
//         return console.log('Erro interno: ', err.message)
//     }
// })

app.get('/run_tokenizer', async (req, res) => {
    try {
        let tokenizados = 0
        const questions = await QuestionsModel.find({
            tokenized: false,
            best_answer: false,
            answers: { $exists: true, $not: { $size: 0 } } 
        })
    
        for (const question of questions) {
            try {
                const { _id, question: questionText } = question;
    
                const tokens = await TokenGenerator.generate(questionText);

                if(tokens.values.length == 0) {
                    console.log("Erro com a questão: " + _id.toString())
                    continue
                }
        
                await TokensNB.create({
                    token: tokens.values,
                    question: _id,
                });
        
                await QuestionsModel.findByIdAndUpdate(_id, { tokenized: true });
        
                await new Promise(resolve => setTimeout(resolve, 1000));
                tokenizados++
            } catch (err) {
                console.log(err)
                continue
            }
        }
        return res.status(200).send(tokenizados)
    } catch (err) {
        return res.status(500).send('Erro')
    }
})

app.get('/update', async (req, res) => {
    await MilvusController.search(req.body)
    return res.status(200).send('Ok')
})

app.post('/get_response', async (req, res) => {
    try {
        const { body } = req

        const tokens = await TokenGenerator.generate(body.message)
        const mostSimilar = await MilvusController.search(tokens.values)
        if(!mostSimilar) throw new Error("Não foi possivel localizar similaridade")

        const question = await QuestionsModel.findOne({_id: mostSimilar.question_id})

        const GeminiResponse = await TokenGenerator.generateResponse(body.message, question)

        if(GeminiResponse) return res.status(200).send({ response: GeminiResponse })

        throw new Error("Erro ao montar resposta baseada no banco de dados")
    } catch (err) {
        if(err.message) return res.status(500).send({ response: err.message })
        return res.status(500).send({ response: "Não Foi possível recuperar mensagens, tente novamente mais tarde!" })
    }

})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});