const { AWARD_CATEGORIES, DATABASE } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");
const { SqlGetAll } = require("../sqlFunctions");

module.exports = {
	name: 'award',
	description: 'Submits a nomination for an award',
	async execute(client, message, args) {

        if (!args.length)
            return UtilityFunctions.Send(message, `Input a category to nominate an award for! Use \`!categories\` to see a list of all categoires.`);

        let categories = SqlGetAll(client.sql, DATABASE.AWARD_CATEGORY);

        let matchedCategories = []; 

        for (let category of categories) {
            let valid = true;
            for (let arg of args) {
                if (!category.categoryString.toLowerCase().includes(arg.toLowerCase()))
                {
                    valid = false;
                    break;
                }
            }
            if (valid)
                matchedCategories.push(category);
        }

        let returnMessage = ``;

        if (!matchedCategories.length) 
            return UtilityFunctions.Send(message, `:question: Your input matched no categories. Use \`!categories\` to see all categoires.`);

        let category;

        if (matchedCategories.length == 1)
            category = matchedCategories[0];

        if (matchedCategories.length > 1) 
        {
            for (let i = 0; i < matchedCategories.length; i++) {
                returnMessage += `${i + 1}. *${matchedCategories.categoryString[i]}*\n`;
            }

            returnMessage += `Your input matches multiple categories. Which one would you like? Choose a number.`;

            let choiceInput = await UtilityFunctions.GetInputFromUser(message, returnMessage);
            if (choiceInput == undefined) return;

            let choiceIndex = UtilityFunctions.ProcessNumberedInput(message, choiceInput, matchedCategories.length);
            if (choiceIndex == undefined) return;

            category = matchedCategories[choiceIndex - 1];
        }

        returnMessage = `Let's nominate **${category.categoryString}** then!`;

        UtilityFunctions.Send(message, returnMessage);
    }
};