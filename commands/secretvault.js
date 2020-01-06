
const Enmap = require("enmap");

module.exports = {
	name: 'vault',
	description: 'Sets the secretvault channel',
	guildonly: true,
	execute(client, message, args) {

		const vaultChannelID = args[0];
		client.votes.set("VAULT", vaultChannelID);

		const vaultChannelName = client.channels.get(vaultChannelID).toString();

		client.channels.get(vaultChannelID).send("The vault is locked.");
		message.channel.send("Vault set to: " + vaultChannelName);
	}
};