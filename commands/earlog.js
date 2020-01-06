
const Enmap = require("enmap");

module.exports = {
	name: 'earlog',
	description: 'Sets the ear log channel',
	format: "!earlog <channelid>",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Hey you no do that.");
			return;
		}

		const earLogChannelID = args[0];
		client.votes.set("EAR_LOG", earLogChannelID);

		const earLogString = client.channels.get(earLogChannelID).toString();

		client.channels.get(earLogChannelID).send("Lend me your ears!");
		message.channel.send("Ear Log set to: " + earLogString);
	}
};