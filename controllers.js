var Utils = require('./utils');

const  GetUserBalance = (msg, match, bot) => {
 
    const chatId = msg.chat.id;
    const resp = match[1]; 
   
    bot.sendMessage(chatId, resp);
};

const CreateUser = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    const persons = new Persons({
        name: msg.from.first_name + ' ' + msg.from.first_name,
        tid: msg.from.id,
        balance: 0,
        username: msg.text.split(' ')[1],
    });
    persons.save().then(person => bot.sendMessage(chatId, `
Usuário  ${persons.username} criado com sucesso.

Saldo inicial igual a 0.

Para adicionar Saldo e associar a uma tag digite:
/entrada @usuário *valor #tag

para registrar uma saída, digite:        
/saida @usuário *valor #tags`));


    bot.sendMessage(chatId, resp);
};

const teste = (msg, match, bot) => {
    console.log('ae caralhioooo')
};

const CreditTransaction = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    const value = parseInt(msg.text.split(' ')[1]
        .replace(',', '')
        .replace('.', '')
    );
    if(!value && (typeof value === 'number')) {
        bot.sendMessage(chatId, 'Erro!');
        return;
    }

    const transaction = new Transactions({
        type: 'credit',
        from: msg.from.id,
        value,
        tags: msg.text.split(' ').filter(text => /^#/.test(text))
    });

    transaction.save().then( () => {
        const user = Persons.findOneAndUpdate(
            { tid: msg.from.id },
            { $inc: { balance: value } }
        ).then(resp => {
            bot.sendMessage(chatId, 'registrado');
        }).catch(e => bot.sendMessage(chatId, e));
    }).catch( e => {
        console.log(e)
    })
};

const DebitTransaction = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    const value = parseInt(msg.text.split(' ')[1]
        .replace(',', '')
        .replace('.', '')
    );
    if(!value && (typeof value === 'number')) {
        bot.sendMessage(chatId, 'Erro!');
        return;
    }

    const transaction = new Transactions({
        type: 'debit',
        from: msg.from.id,
        value,
        tags: msg.text.split(' ').filter(text => /^#/.test(text))
    });

    transaction.save().then( () => {
        const user = Persons.findOneAndUpdate(
            { tid: msg.from.id },
            { $inc: { balance: -value } }
        ).then(resp => {
            bot.sendMessage(chatId, 'registrado');
        }).catch(e => bot.sendMessage(chatId, e));
    }).catch( e => {
        console.log(e)
    })
};

const GetTotalBalance = (msg, match, bot) => {
    const chatId = msg.chat.id;
    Persons.find({}).then((persons) => {
        const total = persons.reduce(
            (accumulator, currentValue) => accumulator + currentValue.balance, 
            0
        );
        
        const totalString = total.toString();
        const reals = totalString.substring(0, totalString.length - 2);
        const cents = totalString.substring(totalString.length - 2);
        const message = `Total: R$ ${reals},${cents}`;
        bot.sendMessage(chatId, message);
    });
};

const GetOneBalance = (msg, match, bot) => {
    const chatId = msg.chat.id;
    console.log('entrou')
    const username = msg.text.split(' ')[1];
    console.log(username, match[1])
    Persons.findOne({ username }).then(data => {

        bot.sendMessage(chatId, `Nome:  ${data.username} -  Balanço : ${Utils.intToBRL(data.balance)}`);
    }).catch(err => {
        console.log(err);
    });
}

const GetHelp = (msg, match, bot) => {
    const chatId = msg.chat.id;

    const message = `Olá, eu sou o bot do caixa coletivo.
    Digite:
    /saldo Para saber o saldo total do caixa
    
    /saldo @usuario Para saber o saldo de um usuário

    /todos para ver todos as pessoas cadastradas no caixa

    /criar @seu-usuário para criar seu caixa

    /entrada 5.00 #hashtag para adicionar uma entrada no caixa

    /saida 4,35 #hashtag para adicionar uma saída no caixa

    /balanço #tag para ver todas transações daquela tag

    /balanço @usuario para ver todas transações daquela tag

    /saidas #tag para ver todas transações daquela tag
    
    /entradas #tag para ver todas transações daquela tag

    `

    bot.sendMessage(chatId, message);
};

const GetUsers = (msg, match, bot) => {
    const chatId = msg.chat.id;

    Persons.find({}).then(persons => {
        let Sentences = persons.map( person => `Nome:  ${person.username} -  Balanço : ${Utils.intToBRL(person.balance)} \n`)
        bot.sendMessage(chatId, Sentences.join(''))
    })
};

const GetTransactions = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const tags = msg.text.split(' ')[1];
    if(tags[0] === '#'){
        Transactions.find({tags}).then(transactions => {
            let Sentences = transactions.map( transaction => `Tipo:  ${transaction.type === 'credit' ? 'Entrada' : 'Saída'} -  Valor : ${Utils.intToBRL(transaction.value)} \n`)
            bot.sendMessage(chatId, Sentences.join(''))
        }).catch( e => {
            bot.sendMessage(chatId, 'não foi possível Completar')
    
        })
    } else if(tags[0] ==='@'){
        console.log(tags)
        Persons.findOne({username : tags }).then( person => {
            console.log(person)
            Transactions.find({from: person.tid}).then(transactions => {
                let Sentences = transactions.map( transaction =>  {
                    
                    let tag = transaction.tags.length ? `Tags - ${transaction.tags.join(' ')}` : '';
                    return `Tipo:  ${transaction.type === 'credit' ? 'Entrada' : 'Saída'} -  Valor : ${Utils.intToBRL(transaction.value)} ${tag} \n`
                })
                bot.sendMessage(chatId, Sentences.join(''))
            }).catch( e => {
                bot.sendMessage(chatId, 'não foi possível Completar')
            })
        }).catch(e => bot.sendMessage(chatId, 'não foi possível Completar'));
    }

};

const GetAllCredits = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const tags = msg.text.split(' ')[1];
    Transactions.find({tags, type: 'credit'}).then(transactions => {
        let Sentences = transactions.map( transaction => `Tipo:  ${ 'Entrada' } -  Valor : ${Utils.intToBRL(transaction.value)} \n`)
        bot.sendMessage(chatId, Sentences.join(''))
    })
};

const GetAllDebits = (msg, match, bot) => {
    const chatId = msg.chat.id;
    const tags = msg.text.split(' ')[1];
    Transactions.find({tags, type: 'debit'}).then(transactions => {
        let Sentences = transactions.map( transaction => `Tipo:  ${ 'Saída' } -  Valor : ${Utils.intToBRL(transaction.value)} \n`)
        bot.sendMessage(chatId, Sentences.join(''))
    })
};

module.exports = {
    GetUserBalance, GetHelp, CreateUser, CreditTransaction,
    DebitTransaction, GetTotalBalance, GetOneBalance, GetUsers, GetTransactions, GetAllCredits, GetAllDebits
};