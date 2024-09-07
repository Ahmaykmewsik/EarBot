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

// const token = process.env.tokenFearBot;
// const prefix = process.env.prefixFear;

// const token = process.env.tokenTesterBot;
// const prefix = process.env.prefixTester;

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

let bots = [
	//  {
	// 	 token: process.env.tokenTesterBot,
	// 	 prefix: process.env.prefixTester
	//  },
	{
		token: process.env.tokenEarBot,
		prefix: process.env.prefixEar,
	},
	{
		token: process.env.tokenQueerBot,
		prefix: process.env.prefixQueer,
	},
	{
		token: process.env.tokenFearBot,
		prefix: process.env.prefixFear
	},
	{
		token: process.env.tokenGearBot,
		prefix: process.env.prefixGear,
	},
	{
		token: process.env.tokenCareerBot,
		prefix: process.env.prefixCareer,
	},
	{
		token: process.env.tokenBeerBot,
		prefix: process.env.prefixBeer,
	},
	{
		token: process.env.tokenModBot,
		prefix: process.env.prefixMod,
	},
];

for (let bot of bots) {
	bot.client = new Client({ intents: myIntents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
}

function ResetIfInactive(client, vaultChannelData) {
	//two weeks
	let expireTime = 14 * 24 * 60 * 60 * 1000;
	if (vaultChannelData && vaultChannelData.vaultID && vaultChannelData.lastPostTime + expireTime < Date.now()) {
		vaultChannelData.vaultID = null;
		client.setVaultID.run(vaultChannelData);
		client.user.setActivity('', { type: 'LISTENING' });
	}
}

for (let bot of bots) {

	let client = bot.client;

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

			sql.prepare(
				`CREATE TABLE vaultID(
					botUserID TEXT PRIMARY KEY,
					guildID TEXT,
					vaultID TEXT,
					lastPostTime INTEGER
			)`
			).run();

			sql.prepare(
				`CREATE TABLE avatarURLDatabase(
					id INTEGER PRIMARY KEY,
					userDiscordID TEXT,
					guildID TEXT,
					avatarID TEXT,
					reuploadedAvatarURL TEXT
			)`
			).run();

			sql.pragma("synchronous = 1");
			sql.pragma("journal_mode = wal");

			console.log("Completed First Time SQL Setup");

		}

		client.getVaultID = sql.prepare(
			`SELECT * from vaultID WHERE botUserID = ?`
		);

		client.setVaultID = sql.prepare(
			`INSERT OR REPLACE INTO vaultID (botUserID, guildID, vaultID, lastPostTime)
		VALUES (@botUserID, @guildID, @vaultID, @lastPostTime)`
		);

		client.getDefaultAvatar = sql.prepare(
			`SELECT * FROM avatarURLDatabase
		WHERE userDiscordID = ? AND guildID = 'DEFAULT'`
		);

		client.getGuildAvatar = sql.prepare(
			`SELECT * FROM avatarURLDatabase
		WHERE userDiscordID = ? AND guildID = ? `
		);

		client.setAvatar = sql.prepare(
			`INSERT OR REPLACE INTO avatarURLDatabase(userDiscordID, guildID, avatarID, reuploadedAvatarURL)
		VALUES(@userDiscordID, @guildID, @avatarID, @reuploadedAvatarURL)`
		);

		client.deleteAvatar = sql.prepare(
			`DELETE FROM avatarURLDatabase WHERE id = ?`
		);

		let loginMessage;

		switch (client.user.username) {
			case "TesterBot":
				loginMessage = "Testerbot is Testing!";
				break;
			case "EarBot":
				loginMessage = "EarBot Ready!";
				break;
			case "QueerBot":
				loginMessage = "QueerBot Slaying!";
				break;
			case "FearBot":
				loginMessage = "FearBot is a Scardy!";
				break;
			case "GearBot":
				loginMessage = "Gearbot is Turning!";
				break;
			case "CareerBot":
				loginMessage = "CareerBot is Capitalisming!";
				break;
			case "BeerBot":
				loginMessage = "BeerBot is Adulting!";
				break;
			case "ModBot":
				loginMessage = "Modbot is Moderating!";
				break;
			default:
				loginMessage = "Who the hell is ready?????"
				break;
		}

		console.log(loginMessage);
	});

	client.on('messageCreate', async message => {

		// for (let guild of client.guilds.cache) {
		// 	console.dir(guild[1].name);
		// }

		if (message.author.bot) return;

		///DM VAULT---------------------------------------------------------------------------

		let objective_hub_guild_id = "660306459397193728";
		let objective_hub_guild = client.guilds.cache.get(objective_hub_guild_id);

		if (message.channel.type === "DM") {

			try {

				let vaultChannelData = client.getVaultID.get(client.user.id);

				if (!vaultChannelData)
					message.author.send(":x: The GM needs to setup the vault channel.");

				if (client.user.username != "ModBot")
					ResetIfInactive(client, vaultChannelData);

				//Color in the hub server
				let color;
				if (objective_hub_guild) {
					let user = await objective_hub_guild.members.cache.get(message.author.id);
					if (user)
						color = user.displayHexColor;
				}

				let vaultChannel = null;
				if (vaultChannelData.vaultID)
					vaultChannel = client.channels.cache.get(vaultChannelData.vaultID);

				if (vaultChannel) {
					let imageURL = (message.attachments.size) ? message.attachments.first().url : "";
					let bodyText = message.content;
					let outsideEmbedText = "";

					let splitString = bodyText.split(" ");
					for (let i in splitString) {
						if (splitString[i].slice(0, 4) == "http") {
							outsideEmbedText = splitString[i];
							splitString.splice(i, 1);
							bodyText = splitString.join(" ");
							break;
						}
					}

					let embed = new Discord.MessageEmbed()
						.setDescription(bodyText)

					let returnMessage = `Sent anonymously to the Objective Hub moderator channel.`;
					let waittime = 5000;
					if (client.user.username != "ModBot") {
						let avatarURL = await UtilityFunctions.GetStoredUserURL(client, message, message.author.id, vaultChannel.guild);
						embed.setAuthor({ name: message.author.username, iconURL: avatarURL })
						embed.setColor(color)
						waittime = 2000;
						returnMessage = `*Sent to vault in **${vaultChannel.guild.name}***`;
					}

					if (imageURL && imageURL.length)
						embed.setImage(imageURL)

					let noImageAttachments = Array.from(UtilityFunctions.FilterImages(message.attachments).values());

					await vaultChannel.send({ embeds: [embed], files: noImageAttachments });
					if (outsideEmbedText.length)
						await vaultChannel.send({ content: outsideEmbedText });

					vaultChannelData.vaultID = Date.now();
					client.setVaultID.run(vaultChannelData);

					let msg = await message.author.send(returnMessage);
					await UtilityFunctions.sleep(waittime);
					await msg.delete();
				}
				else {
					return message.author.send(`This earbot is not set to a vault channel! Someone needs to get their shit together.`);
				}
			}
			catch (error) {
				console.error(error);
				return message.author.send(`Huh? Something went wrong with that! Contact your GM or Ahmayk.\`\`\`${error}\`\`\``);
			}
		}

		///COMMANDS ---------------------------------------------------------------------------
		if (!message.content.startsWith(bot.prefix) || message.author.bot) return;

		if (client.user.username == "ModBot" &&
			(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) ||
			  message.guild.id != objective_hub_guild_id)) {
			message.channel.send("Modbot can only be configured by moderators in the Objective Hub.");
			return;
		}

		const args = message.content.slice(bot.prefix.length).split(/ +/);
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

	client.login(bot.token);
}

// cron.schedule('*/9 * * * *', async () => {
cron.schedule('* * * * *', async () => {

	for (let bot of bots) {

		let client = bot.client;

		let vaultChannelData = client.getVaultID.get(client.user.id);
		if (vaultChannelData) {

			if (client.user.username != "ModBot")
				ResetIfInactive(client, vaultChannelData);

			let vaultChannel = client.channels.cache.get(vaultChannelData.vaultID);
			if (vaultChannel)
				client.user.setActivity(vaultChannel.guild.name, { type: 'LISTENING' });
		}
	}

});
