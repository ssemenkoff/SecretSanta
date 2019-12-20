import MessageHandler from "./message-handler.js"
import Telegraf from "telegraf"
import Key from "./secret-santa-7f246-firebase-adminsdk-rd0vh-9308100421.json"
import admin from "firebase-admin"
import express from "express"

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(TOKEN)
const app = express()

admin.initializeApp({
  credential: admin.credential.cert(Key)
});
let db = admin.firestore();

const handler = new MessageHandler(bot, db);

bot.on('text', (ctx) => {
  handler.HandleMessage(ctx)
})

bot.telegram.setWebhook('https://ssecretsanta.azurewebsites.net/secret-path')

app.get('/', async (req, res) => {
  res.send(`Bot has started`)
})

app.use(bot.webhookCallback('/secret-path'))

app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}!`)
})

console.log("Application initialization compete!")
