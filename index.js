const express = require('express');
const Scrapper = require('./controllers/scrapper');
const app = express();
const TokenGenerator = require('./controllers/tokenGenerator')
const QuestionsModel = require('./models/questions')
const Tokens = require('./models/tokens')
const TokensNB = require('./models/tokensnb')

const PORT = process.env.PORT || 3000;

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
    await Tokens.create({
        token: req.body,
        question: "66dcc4b7d1a680bbd685f152",
    });
    return res.status(200).send('Ok')
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});