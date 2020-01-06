module.exports = {
	name: 'arrive',
	description: 'allows access to a channel',
	format: "!arrive <@player>",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Hey you no do that.");
			return;
		}

        args.forEach(player => {
            message.channel.replacePermissionOverwrites( player, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true
            });
        });

	}
};