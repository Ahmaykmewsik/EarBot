const { AWARD_CATEGORIES } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");

module.exports = {
	name: 'categories',
	description: 'Lists all award categories as they are stored in the bot.',
	async execute(client, message, args) {
        let returnMessage = `__ALL AWARD CATEGORIES__\n- ${AWARD_CATEGORIES.join('\n- ')}`;
        UtilityFunctions.Send(message, returnMessage);
	}
};