const { AWARD_CATEGORIES, DATABASE } = require("../Constants");
const UtilityFunctions = require("../UtilityFunctions");
const sqlFunctions = require("../sqlFunctions");
const { SqlGetAll } = require("../sqlFunctions");

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
		}

		if (categories.some(c => c.categoryString.toLowerCase() == category.categoryString.toLowerCase())) 
			return UtilityFunctions.Send(message, ":x: A category already exists with that name");

		sqlFunctions.SqlSet(client.sql, message, DATABASE.AWARD_CATEGORY, category);

		let returnFunction = `Category Added!`;

        UtilityFunctions.Send(message, 'Category added!');
	}
};