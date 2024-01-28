const { AWARD_CATEGORIES } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");

module.exports = {
	name: 'award',
	description: 'Submits a nomination for an award',
	guildonly: true,
	async execute(client, message, args) {

        let matchedCategories = []; 

        for (let category of AWARD_CATEGORIES) {
            let valid = true;
            for (let arg of args) {
                if (!category.toLowerCase().includes(arg.toLowerCase()))
                {
                    valid = false;
                    break;
                }
            }
            if (valid)
                matchedCategories.push(category);
        }

        let returnMessage = ``;

        if (matchedCategories.length) 
            returnMessage = `Your input matches:\n${matchedCategories.join('\n')}`;
        else
            returnMessage = `Your input matched no categories. Use \`!categories\` to see a list of all categoires.`;

        // let input = await UtilityFunctions.GetInputFromUser(message, "Say something!");
        UtilityFunctions.Send(message, returnMessage);

	}
};