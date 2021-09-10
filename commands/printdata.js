

module.exports = {
	name: 'printdata',
	description: 'Shows internal data',
	format: "!printdata",
	guildonly: true,
	execute(client, message, args) {

		return message.channel.send("This command is depricated.");

		if (!message.member.permissions.has('ADMINISTRATOR')) 
			return message.channel.send("The DATA is not for you.");


		keyArray = client.votes.indexes
        const dataMap = client.votes.fetch(keyArray);
		var printString = "-----ALL DATA-----\n" + dataMap.map((v, k) => ("**" + k + "** => " + v)).join("\n");
		message.channel.send(printString);

	}
};