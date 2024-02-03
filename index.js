const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
require('dotenv').config();

//const { prefix, token } = require('./config.json');

const { Client, Intents } = require('discord.js');

//const cooldowns = new Discord.Collection();

const myIntents = new Intents();
myIntents.add(
Intents.FLAGS.GUILDS,
Intents.FLAGS.GUILD_MEMBERS,
Intents.FLAGS.GUILD_PRESENCES,
Intents.FLAGS.GUILD_MESSAGES,
Intents.FLAGS.DIRECT_MESSAGES
);

let token = process.env.tokenTesterBot;
let prefix = process.env.prefixTester;

// let token = process.env.tokenEarBot;
// let prefix = process.env.prefixEar;

let client = new Client({ intents: myIntents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Discord.Collection();

const UtilityFunctions = require('./UtilityFunctions');
const sqlFunctions = require('./sqlFunctions');

//Commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {

    sqlFunctions.SqlSetup(client);

	let loginMessage;

	switch (client.user.username) {
		case "TesterBot": loginMessage = "Testerbot is Testing!"; break;
		case "AwardsBot": loginMessage = "Awardsbot is awarding!"; break;
		default: loginMessage = "Who the hell is ready?????"; break;
	}

	console.log(loginMessage);
});

client.on('messageCreate', async message => {

	// for (let guild of client.guilds.cache) {
	// 	console.dir(guild[1].name);
	// }

	if (message.author.bot) return;

	///COMMANDS ---------------------------------------------------------------------------
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		command.execute(client, message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});

client.login(token);