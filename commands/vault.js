
const Enmap = require("enmap");

module.exports = {
	name: 'vault',
	description: 'Sets the vault channel',
	guildonly: true,
	async execute(client, message, args) {

		let vaultChannelID = args[0];
		if (!vaultChannelID)
			vaultChannelID = message.channel.id;
		client.votes.set("VAULT", vaultChannelID);

		const vaultChannelName = client.channels.cache.get(vaultChannelID).toString();

		client.channels.cache.get(vaultChannelID).send("The vault is locked.");
		let msg = await message.channel.send("Vault set to: " + vaultChannelName);
		msg.pin();
	}
};