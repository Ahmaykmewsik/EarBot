module.exports = {
	name: 'clone',
	description: 'clones a discord channel',
	format: "!clone",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Hey you no do that.");
			return;
		}

        message.channel.clone();
	}
};