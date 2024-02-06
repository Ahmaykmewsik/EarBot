const { AWARD_CATEGORIES, DATABASE, OPTIONS } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");
const sqlFunctions = require("../sqlFunctions");
const { SqlGetAll } = require("../sqlFunctions");
const Discord = require('discord.js');

module.exports = {
	name: 'addcategory',
	description: 'Adds an awards category',
	async execute(client, message, args) {

		if (!args.length)
			return UtilityFunctions.Send(message, ":question: Enter a new awards category to add.");

		let categories = SqlGetAll(client.sql, DATABASE.AWARD_CATEGORY);

		let category = {
			id: null,
			categoryString: args.join(" "),
			optionsFlag: 0,
		}

		if (categories.some(c => c.categoryString.toLowerCase() == category.categoryString.toLowerCase())) 
			return UtilityFunctions.Send(message, ":x: A category already exists with that name");

		let buttons = []; 

		let confirmID = "Confirm";
		
		buttons.push(new Discord.ButtonBuilder()
                .setCustomId(OPTIONS.OPTION_GAME)
                .setLabel("Game")
                .setStyle(Discord.ButtonStyle.Primary));
		buttons.push(new Discord.ButtonBuilder()
                .setCustomId(OPTIONS.OPTION_CHARACTER)
                .setLabel("Character")
                .setStyle(Discord.ButtonStyle.Primary));
		buttons.push(new Discord.ButtonBuilder()
                .setCustomId(OPTIONS.OPTION_PERSON)
                .setLabel("Person")
                .setStyle(Discord.ButtonStyle.Primary));
		buttons.push(new Discord.ButtonBuilder()
                .setCustomId(confirmID)
                .setLabel("Confirm")
                .setStyle(Discord.ButtonStyle.Success));
        let rows = new Discord.ActionRowBuilder().addComponents(buttons);

		sqlFunctions.SqlSet(client.sql, message, DATABASE.AWARD_CATEGORY, category);

		let returnMessage = `Category Added! Here are some buttons.`;

        UtilityFunctions.Send(message, returnMessage, {components: rows});
	}
};