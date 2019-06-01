const TelegramBot = require('node-telegram-bot-api');
const dotEnv = require('dotenv').config();
const Controller = require('./controllers');

var db = require('./db/index.js');

db();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/saldo (.+)/, (msg, match) => Controller.GetOneBalance(msg, match, bot));
bot.onText(/\/entrada (.+)/, (msg, match) => Controller.CreditTransaction(msg, match, bot));
bot.onText(/\/saida (.+)/, (msg, match) => Controller.DebitTransaction(msg, match, bot));
bot.onText(/\/criar (.+)/, (msg, match) => Controller.CreateUser(msg, match, bot));
bot.onText(/\/saldo$/, (msg, match) => Controller.GetTotalBalance(msg, match, bot));
bot.onText(/\/balanço (.+)/, (msg, match) => Controller.GetTransactions(msg, match, bot));
bot.onText(/\/entradas (.+)/, (msg, match) => Controller.GetAllCredits(msg, match, bot));
bot.onText(/\/saidas (.+)/, (msg, match) => Controller.GetAllDebits(msg, match, bot));
bot.onText(/\/ajuda$/, (msg, match) => Controller.GetHelp(msg, match, bot));
bot.onText(/\/todos$/, (msg, match) => Controller.GetUsers(msg, match, bot));
 
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {});