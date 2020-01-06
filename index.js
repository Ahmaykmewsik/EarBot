const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
const { prefix, token } = require('./config.json');
const cooldowns = new Discord.Collection();


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
	console.log('Ready!');
});

client.on('message', message => {

	if (message.author.bot) return; // Ignore bots.

	const vaultChannelID = client.votes.get("VAULT");//Get vault channel;
	const guildID = "660306459397193728";//Get Guild ID


	if (message.channel.type === "dm") {

		if (vaultChannelID != undefined) {
			//Color and send message
			const user = client.guilds.get(guildID).fetchMember(message.author).then((user) => {
				var color = user.displayHexColor;

				//Put the message in a cute little embed
				const embed = new Discord.RichEmbed()
					.setDescription(message.content)
					.setColor(color)
					.setAuthor(message.author.username, message.author.avatarURL )

				//Add Image if it exists
				if (message.attachments.array().length != 0) {
					embed.setImage(message.attachments.array()[0].url)
				}

				client.channels.get(vaultChannelID).send(embed);
			})		

			message.author.send("Sent to vault.").then(msg => {
				 msg.delete(5000);
 				 });
		}
		else {
			message.author.send("The GM needs to setup the vault channel.");
		}
		return;
	}

	var earLogChannelID = client.votes.get("EAR_LOG");

	if (message.channel.name[0] == "p") {
		//Copy to Ear Log
		if (!message.content.includes("-purge ")) {
			client.channels.get(earLogChannelID).send("**[" + message.channel.name + "] " + message.author.username + "**: " + message.content);
		}

		//Lock it GM locks it
		if (message.content.toLowerCase() == "lock") {
			message.channel.overwritePermissions(message.channel.guild.defaultRole, { SEND_MESSAGES: false });
		}

		return;
	}

	
	//commands
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
	    message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);