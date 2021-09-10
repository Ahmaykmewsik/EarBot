module.exports = {
	name: 'vault',
	description: 'Sets the vault channel',
	guildonly: true,
	async execute(client, message, args) {

		if (!message.member.permissions.has('ADMINISTRATOR')) {
			message.channel.send("Hey, you no do that.");
			return;
		}

		let vaultChannelID = args[0];
		if (!vaultChannelID)
			vaultChannelID = message.channel.id;

		client.setVaultID.run({id: 0, guildID: message.guild.id, vaultID: vaultChannelID});

		const vaultChannelName = client.channels.cache.get(vaultChannelID).toString();
		let msg = await client.channels.cache.get(vaultChannelID).send("The vault is locked.");
		msg.pin();
		message.channel.send("Vault set to: " + vaultChannelName);
	}
};