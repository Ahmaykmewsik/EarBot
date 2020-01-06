module.exports = {
	name: 'leave',
	description: 'leave',
	format: "!leav",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Hey you no do that.");
			return;
		}

        message.channel.lockPermissions();
	}
};