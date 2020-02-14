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

//Something I coped from online that takes strings and turns them into one of these colors.
String.prototype.toColor = function() {
	var colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]
	
	var hash = 0;
	if (this.length === 0) return hash;
	for (var i = 0; i < this.length; i++) {
		hash = this.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	hash = ((hash % colors.length) + colors.length) % colors.length;
	return colors[hash];
}

client.on('ready', () => {
	console.log('EarBot Ready!');
});

client.on('message', message => {

	if (message.author.id == 660290238412881930) return; // Ignore self.

	const vaultChannelID = client.votes.get("VAULT");//Get vault channel;
	const guildID = "660306459397193728";//Get Guild ID


	///DM VAULT---------------------------------------------------------------------------

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

	///EAR LOG---------------------------------------------------------------------------

	// var earLogChannelID = client.votes.get("EAR_LOG");

	if (message.channel.name[0] == "p") {

		// if (earLogChannelID == undefined) {
		// 	message.channel.send("The GM needs to setup the Ear Log channel!");
		// 	return
		// }

		// //Copy to Ear Log
		// if (!message.content.startsWith(prefix)) {

		// 	var areaname = message.channel.name.split("-");
		// 	areaname.shift();
		// 	areaname = areaname.join("");

		// 	const earLogEmbed = new Discord.RichEmbed()
		// 		.setColor(areaname.toColor())
		// 		.setAuthor(message.channel.name, message.author.avatarURL)
		// 		.setDescription("**" + message.author.username.toUpperCase() + "** `" + message.member.nickname + "`: " + message.content)

		// 	if (message.attachments.array().length != 0) {
		// 		earLogEmbed.setImage(message.attachments.array()[0].url)
		// 	}

		// 	client.channels.get(earLogChannelID).send(earLogEmbed);
		// }


		//Lock it GM locks the channel
		if ((message.content.toLowerCase() == "lock") && (message.member.hasPermission('ADMINISTRATOR'))) {
			console.log("LOCK")
			message.channel.overwritePermissions(message.channel.guild.defaultRole, { SEND_MESSAGES: false });
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
	    message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);