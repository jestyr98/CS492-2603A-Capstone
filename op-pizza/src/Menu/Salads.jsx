import garden from '../assets/garden.jpg'
import caesar from '../assets/caesar.jpg'
const salads = [
	{
    	name: 'Garden House Salad',
    	description: 'Crisp romaine, cherry tomatoes, cucumbers, croutons, and parmesan with herb vinaigrette.',
    	price: '$8.99',
    	photo: garden,

    	options: {
        	dressing: [
            	'Herb Vinaigrette',
            	'Ranch',
            	'Caesar',
            	'Italian',
            	'Balsamic Vinaigrette',
        	],

        	removeIngredients: [
            	'Romaine',
            	'Cherry Tomatoes',
            	'Cucumbers',
            	'Croutons',
            	'Parmesan',
        	],

        	addExtras: [
            	{
                	name: 'Extra Parmesan',
                	price: 1.00,
            	},

            	{
                	name: 'Extra Croutons',
                	price: 0.75,
            	},

            	{
                	name: 'Grilled Chicken',
                	price: 3.00,
            	},
        	],
    	},
    },

	{
  		name: 'Chicken Caesar',
  		description: 'Grilled chicken, shaved parmesan, garlic croutons, and classic Caesar dressing.',
  		price: '$10.99',
  		photo: caesar,

  		options: {
    	dressing: [
      		'Caesar',
      		'Light Caesar',
    	],

    	removeIngredients: [
      		'Grilled Chicken',
      		'Shaved Parmesan',
      		'Garlic Croutons',
      		'Caesar Dressing',
    	],

    	addExtras: [
      		{
        		name: 'Extra Grilled Chicken',
        		price: 3.00,
      		},

      		{
        		name: 'Extra Parmesan',
        		price: 1.00,
      		},

      		{
        		name: 'Extra Croutons',
        		price: 0.75,
      		},
    	],
  	},
},
]

export default salads
