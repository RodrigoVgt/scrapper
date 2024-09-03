const express = require('express');
const schedule = require('node-schedule')
const Scrapper = require('./controllers/scrapper');
const PageControll = require('./models/page-control-model')
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

schedule.scheduleJob('*/2 * * * *', async () => {
    try {
        const page = await PageControll.findOne({current: true})
        const result = await Scrapper.run(page.last_page)
        await PageControll.updateOne({_id: page._id}, {$set: {last_page: result}})
        return console.log("Roudou até a página: " + result)
    } catch (err) {
        console.error(err)
        return console.log('Erro interno: ', err.message)
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});