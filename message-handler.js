class MessageHandler {
    constructor(bot, db) {
        this.bot = bot
        this.db = db
    }
    async HandleMessage(ctx) {
        const userList = await this.getUsers()
        const santaRegex = /.*Санта.*/gmi
        const hiRegex = /.*(здарова|привет|хай).*/gmi;
        const rulesRegex = /.*объясни правила.*/gmi
        const started = (userList.length ===  (process.env.PARTICIPANTS_COUNT * 1))
        const ended = (process.env.ENDED == 'true');
  
        if (rulesRegex.test(ctx.message.text) && ctx.message.chat.type !== "private" && santaRegex.test(ctx.message.text)) {
            this.reply(ctx, 'Сейчас вы все должны написать \'+\' в чат и я добавлю всех отписавших в список участвующих. Когда все добавятся в список, вам нужно будет написать мне в личку любой текст, и я назову имя человека, для которого вы будете готовить подарок.')
            return
        }
  
        if (ctx.message.text === "+" && ctx.message.chat !== "private") {
            await this.addUser({ id: ctx.message.from.id + "", firstName: ctx.message.from.first_name, lastName: ctx.message.from.last_name || '', sentGift: false, getGift: false })
  
            let updatedUserList = await this.getUsers()
            if (updatedUserList.length === (process.env.PARTICIPANTS_COUNT * 1)) {
                this.reply(ctx, 'Поздравляю, наконец-то этот последний мудак поставил плюсик. Теперь вы можете писать мне в личку любой текст и я отправлю вам имя человека, которому вам нужно будет приготовить подарок.')
            }
            return
        }
  
        if (ctx.message.chat.type === "private") {
            if (!started) {
                this.reply(ctx, 'Пока еще не все записались. Тебе придется подождать.')
                return
            }
  
            if(!ended) {
              let askingUser = userList.find((e) => e.id === ctx.message.from.id + "")
              if (askingUser.sentGift) {
                  this.reply(ctx, 'Ты уже получил человека, которому дарить')
                  return
              } else {
                  const toGift = userList.filter((e) => e.id !== ctx.message.from.id + "" && !e.getGift)
                  if (toGift.length) {
                      const userId = Math.floor(Math.random() * toGift.length)
                      const user = toGift[userId]
  
                      const originalUser = userList.find((e) => e.id === user.id)
                      this.getGift(originalUser.id)
                      this.sendGift(askingUser.id)
  
                      this.reply(ctx, `Привет\nТвой человек это: ${user.firstName} ${user.lastName}`)
                      return
                  }
              }
            }
            
            this.reply(ctx, 'Все подарки уже раздали, не пиши сюда больше')
            return
        }
  
        if (santaRegex.test(ctx.message.text)) {
            if (hiRegex.test(ctx.message.text)) {
                this.reply(ctx, "Привет, грязные животные, ХОХОХОХО")
            };
        }
    }
    async addUser(obj) {
        await this.db.collection('participants').doc(obj.id).set(obj)
    }
    async getUsers() {
        let result = []
        const dataSnapshot = await this.db.collection('participants').get()
        dataSnapshot.forEach((doc) => result.push(doc.data()))
        return result
    }
    sendGift(userId) {
        this.db.collection('participants').doc(userId).set({ sentGift: true }, { merge: true })
    }
    getGift(userId) {
        this.db.collection('participants').doc(userId).set({ getGift: true }, { merge: true })
    }
    async reply(ctx, message) {
        try {
            await this.bot.telegram.sendMessage(ctx.chat.id, message)
        } catch (e) {
            console.error(err)
        }
    }
  }
  
  module.exports = MessageHandler