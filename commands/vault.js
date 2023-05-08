const Discord = require('discord.js');

module.exports = {
	name: 'vault',
	description: 'Sets the vault channel',
	guildonly: true,
	async execute(client, message, args) {

		if (!message.member || !message.member.permissions.has('ADMINISTRATOR')) {
			message.channel.send("Hey, you no do that.");
			return;
		}

		let vaultChannelID = args[0];
		if (!vaultChannelID)
			vaultChannelID = message.channel.id;

		let vaultChannelData = {
			botUserID: client.user.id,
			guildID: message.guild.id,
			vaultID: vaultChannelID
		}
		client.setVaultID.run(vaultChannelData);

		let vaultChannelName = client.channels.cache.get(vaultChannelID).toString();
		
		let msg = await client.channels.cache.get(vaultChannelID).send("The vault is locked.");
		msg.pin();

		message.channel.send("Vault set to: " + vaultChannelName);

		client.user.setActivity(message.guild.name, { type: 'LISTENING' });
	}
};