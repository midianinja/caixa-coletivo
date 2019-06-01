var mongoose = require('mongoose');
const dotEnv = require('dotenv').config();



module.exports = ()=>{
  const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useFindAndModify:false,
  }

const connectWithRetry = () => {
  console.log('MongoDB connection with retry')
  mongoose.connect(process.env.MONGO_URL, options).then(()=>{
    console.log('MongoDB is connected')
  }).catch(err=>{
    console.log('MongoDB connection unsuccessful, retry in 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}

connectWithRetry()


var Schema = mongoose.Schema;  
  
var caixaPersonSchema = new Schema({  
 name: {type: String, required: true},  
 username: {type: String, required: true},  
 tid: {type: String, required: true},  
 balance: {type: Number, required: true},
 created_at: { type: Date, default: Date.now }
}, {collection: 'persons'});

var transactionSchema = new Schema({
    type: {type: String, require: true },
    from: {type: String, ref: 'caixaPerson' , require: true},
    value: {type: Number, required: true},
    tags: {type: Array, default: []}
}, {collection: 'transactions' });


  
Persons = mongoose.model('persons', caixaPersonSchema);  
Transactions = mongoose.model('transactions', transactionSchema);

}

