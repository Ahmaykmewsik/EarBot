const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

//const { prefix, token } = require('./config.json');


// const token = process.env.tokenEarBot;
// const prefix = process.env.prefixEar;

// const token = process.env.tokenQueerBot;
// const prefix = process.env.prefixQueer;

const token = process.env.tokenFearBot;
const prefix = process.env.prefixFear;

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

let client = new Client({ intents: myIntents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

const SQLite = require("better-sqlite3");
const UtilityFunctions = require('./UtilityFunctions');
const sql = new SQLite('./data.sqlite');

//Commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {

	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'vaultID';").get();
	if (!table['count(*)']) {
		//Reuploaded avatar URL database

		sql.prepare(
			`CREATE TABLE vaultID(
				id INT PRIMARY KEY,
				guildID TEXT,
				vaultID TEXT
			)`
		).run();

		sql.prepare(
			`CREATE TABLE avatarURLDatabase(
				userDiscordID TEXT PRIMARY KEY,
				avatarID TEXT,
				reuploadedAvatarURL TEXT
			)`
		).run();

		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");

		console.log("Completed First Time SQL Setup");

	}

	client.getVaultID = sql.prepare(
		`SELECT * from vaultID WHERE id = 0`
	);

	client.setVaultID = sql.prepare(
		`INSERT OR REPLACE INTO vaultID (id, guildID, vaultID)
		VALUES (@id, @guildID, @vaultID)`
	);

	client.getAvatar = sql.prepare(
		`SELECT * FROM avatarURLDatabase
		WHERE userDiscordID = ?`
	);

	client.setAvatar = sql.prepare(
		`INSERT OR REPLACE INTO avatarURLDatabase (userDiscordID, avatarID, reuploadedAvatarURL)
		VALUES (@userDiscordID, @avatarID, @reuploadedAvatarURL)`
	);

	let loginMessage;

	switch (client.user.username) {
		case "EarBot":
			loginMessage = "EarBot Ready!";
			break;
		case "QueerBot":
			loginMessage = "QueerBot Slaying!";
			break;
		case "FearBot":
			loginMessage = "FearBot is a Scardy!";
			break;
		default:
			loginMessage = "Who the hell is ready?"
			break;
	}

	console.log(loginMessage);
});

client.on('messageCreate', async message => {

	if (message.author.bot) return;

	const vaultChannelData = client.getVaultID.get();//Get vault channel;
	const guildID = "660306459397193728";//Guild ID for Objective Hub

	///DM VAULT---------------------------------------------------------------------------

	if (message.channel.type === "DM" && !vaultChannelData)
		return message.author.send(":x: The GM needs to setup the vault channel.");

	if (message.channel.type === "DM" && vaultChannelData) {

		try {
			//Color in the hub server
			let color;
			try {
				let user = await client.guilds.cache.get(guildID).members.fetch(message.author);
				color = user.displayHexColor;
			} catch {
				//Don't so anything special if they're not in the hub server. It shouldn't be a requirement!
			}

			let vaultChannel = client.channels.cache.get(vaultChannelData.vaultID);

			let avatarURL = await UtilityFunctions.GetStoredUserURL(client, message, message.author.id, vaultChannel.guild);

			let imageURL = (message.attachments.size) ? message.attachments.first().url : "";

			//Put the message in a cute little embed
			const embed = new Discord.MessageEmbed()
				.setDescription(message.content)
				.setColor(color)
				.setAuthor(message.author.username, avatarURL)
				.setImage(imageURL)

			let noImageAttachments = UtilityFunctions.FilterImages(message.attachments);

			//Send it!
			await vaultChannel.send({ embeds: [embed], files: noImageAttachments });

			//Nofity
			let msg = await message.author.send(`*Sent to vault in **${vaultChannel.guild.name}***`);
			await UtilityFunctions.sleep(5000);
			await msg.delete();
		}
		catch (error) {
			console.error(error);
			return message.author.send(`Huh? Something went wrong with that! Contact your GM or Ahmayk. \`\`\`${error}\`\`\``);
		}
	}

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


cron.schedule('*/9 * * * *', async () => {

	const vaultChannelData = client.getVaultID.get();//Get vault channel;
	let vaultChannel = client.channels.cache.get(vaultChannelData.vaultID);

	if (vaultChannel) {
		client.user.setActivity(vaultChannel.guild.name, { type: 'LISTENING' });
	}

});


client.login(token);