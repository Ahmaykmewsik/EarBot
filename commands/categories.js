const { AWARD_CATEGORIES, DATABASE } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");
const { SqlGetAll } = require("../sqlFunctions");

module.exports = {
	name: 'categories',
	description: 'Lists all award categories as they are stored in the bot.',
	async execute(client, message, args) {

		let categories = SqlGetAll(client.sql, DATABASE.AWARD_CATEGORY);

		let returnMessage = (categories.length)
			? `__ALL AWARD CATEGORIES__\n- ${categories.map(c => c.categoryString).join('\n- ')}`
			: `No Award Categories yet. Add one with \`!addcategory\``;

        UtilityFunctions.Send(message, returnMessage);
	}
};