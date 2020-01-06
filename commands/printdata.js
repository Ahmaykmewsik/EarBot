
const Enmap = require("enmap");

module.exports = {
	name: 'printdata',
	description: 'Shows internal data',
	format: "!printdata",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("The DATA is not for you.");
			return;
		}

		keyArray = client.votes.indexes
        const dataMap = client.votes.fetch(keyArray);
		var printString = "-----ALL DATA-----\n" + dataMap.map((v, k) => ("**" + k + "** => " + v)).join("\n");
		message.channel.send(printString);

	}
};