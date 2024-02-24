const Discord = require('discord.js');

module.exports = {
	name: 'unvault',
	description: 'Unsets the vault channel',
	guildonly: true,
	async execute(client, message, args) {

		if (!message.member || !message.member.permissions.has('ADMINISTRATOR')) {
			message.channel.send("Hey, you no do that.");
			return;
		}

		let vaultChannelData = {
			botUserID: client.user.id,
			guildID: null,
			vaultID: null, 
		}
		client.setVaultID.run(vaultChannelData);

		message.channel.send(`The vault is no more in ${message.guild.name}` );
		client.user.setActivity('', { type: 'LISTENING' });
	}
};