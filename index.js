const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
require('dotenv').config();

//const { prefix, token } = require('./config.json');

const token = process.env.token;
const prefix = process.env.prefix;

//const cooldowns = new Discord.Collection();


const client = new Discord.Client();
client.commands = new Discord.Collection();

//Enmap
const Enmap = require("enmap");
//const EnmapLevel = require("enmap-level");
//const EnmapRethink = require('enmap-rethink');

client.votes = new Enmap({
	name: "votes",
	autoFetch: true,
	fetchAll: false,
	cloneLevel: 'deep'
});
//const votes = new Enmap({provider: provider});


//Commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {
	console.log('EarBot Ready!');
});

client.on('message', async message => {

	if (message.author.id == 660290238412881930) return; // Ignore self.

	const vaultChannelID = client.votes.get("VAULT");//Get vault channel;
	const guildID = "660306459397193728";//Get Guild ID

	///DM VAULT---------------------------------------------------------------------------

	if (message.channel.type === "dm" && !vaultChannelID)
		return message.author.send("The GM needs to setup the vault channel.");

	if (message.channel.type === "dm" && vaultChannelID) {

		try {
			//Color in the hub server
			const user = await client.guilds.cache.get(guildID).members.fetch(message.author);
			var color = user.displayHexColor;

			//Put the message in a cute little embed
			const embed = new Discord.MessageEmbed()
				.setDescription(message.content)
				.setColor(color)
				.setAuthor(message.author.username, message.author.avatarURL())

			//Add Image if it exists
			if (message.attachments.array().length != 0) {
				embed.setImage(message.attachments.array()[0].url)
			}

			//Send it!
			await client.channels.cache.get(vaultChannelID).send(embed);

			//Nofity
			let msg = await message.author.send("Sent to vault.");
			await msg.delete({ timeout: 5000 });
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

	if (command.args && !args.length) {
		let reply = 'Where are the arguments???';

		if (command.usage) {
			reply += '\nProper usage: \'${prefix}${command.name} ${command.usage}\'';

		}
	}

	try {
		command.execute(client, message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});

client.login(token);