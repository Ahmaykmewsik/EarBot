const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
require('dotenv').config();

//const { prefix, token } = require('./config.json');

const token = process.env.token;
const prefix = process.env.prefix;

const { Client, Intents } = require('discord.js');

//const cooldowns = new Discord.Collection();

const myIntents = new Intents();
myIntents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_WEBHOOKS,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
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

	console.log('EarBot Ready!');
});

client.on('messageCreate', async message => {

	if (message.author.id == 660290238412881930) return; // Ignore self.

	const vaultChannelData = client.getVaultID.get();//Get vault channel;
	const guildID = "660306459397193728";//Guild ID for Objective Hub

	///DM VAULT---------------------------------------------------------------------------

	if (message.channel.type === "DM" && !vaultChannelData)
		return message.author.send(":x: The GM needs to setup the vault channel.");

	if (message.channel.type === "DM" && vaultChannelData) {

		try {
			//Color in the hub server
			const user = await client.guilds.cache.get(guildID).members.fetch(message.author);
			var color = user.displayHexColor;

			let avatarURL = await UtilityFunctions.GetStoredUserURL(client, message, user.id);

			let imageURL = (message.attachments.size) ? message.attachments.first().url : "";

			//Put the message in a cute little embed
			const embed = new Discord.MessageEmbed()
				.setDescription(message.content)
				.setColor(color)
				.setAuthor(message.author.username, avatarURL)
				.setImage(imageURL)

			let noImageAttachments = UtilityFunctions.FilterImages(message.attachments);

			//Send it!
			let vaultChannel = client.channels.cache.get(vaultChannelData.vaultID);

			await vaultChannel.send({embeds: [embed], files: noImageAttachments});

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

client.login(token);