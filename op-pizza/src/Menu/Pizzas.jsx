import supreme from '../assets/supreme.jpg'
import margherita from '../assets/margherita.jpg'
import caprese from '../assets/caprese.png'
import sicilian from '../assets/sicilian.jpg'
import veggie from '../assets/veggie.jpg'
import ewwww from '../assets/ewwww.jpg'
const pizzas = [

	{
  		name: 'Operation Supreme',
  		description: 'Pepperoni, sausage, Canadian bacon, black olives, bell peppers, mushrooms, onions, and mozzarella.',
  		photo: supreme,

  		basePrice: {
    	Personal: 9.99,
    	Medium: 14.99,
    	Large: 16.99,
  	},

  		options: {
    	size: [
      		'Personal',
      		'Medium',
      		'Large',
    	],

    	removeToppings: [
      		'Pepperoni',
      		'Sausage',
      		'Canadian Bacon',
      		'Black Olives',
      		'Bell Peppers',
      		'Mushrooms',
      		'Onions',
      		'Mozzarella',
    	],
  		},
		},
		
	{
		name: 'Margherita Classic',
		description: 'Fresh basil, tomato sauce, and mozzarella on hand-tossed dough.',
		photo: margherita,

		basePrice: {
			Personal: 8.99,
			Medium: 12.99,
			Large: 14.49,
	},

		options: {
		size: [
			'Personal',
			'Medium',
			'Large',
		],

		removeToppings: [
			'Fresh Basil',
			'Mozzarella',
			'Tomato Sauce',
		],

		addExtras: [
			{
				name: 'Extra Basil',
				price: 1.00,
			},

			{
				name: 'Extra Mozzarella',
				price: 1.00,
			},
		],
	},
},
    {
  name: 'Caprese Delight',
  description: 'Basil Pesto sauce, roasted tomatoes, fresh mozzarella, and drizzled balsamic glaze on hand-tossed dough.',
  photo: caprese,

  basePrice: {
    Personal: 8.99,
    Medium: 12.99,
    Large: 14.49,
  },

  options: {
    size: [
      'Personal',
      'Medium',
      'Large',
    ],

    removeToppings: [
      'Basil Pesto Sauce',
      'Roasted Tomatoes',
      'Fresh Mozzarella',
      'Balsamic Glaze',
    ],

    addExtras: [
      {
        name: 'Extra Basil Pesto Sauce',
        price: 1.00,
      },

      {
        name: 'Extra Roasted Tomatoes',
        price: 1.00,
      },

      {
        name: 'Extra Fresh Mozzarella',
        price: 1.00,
      },

      {
        name: 'Extra Balsamic Glaze',
        price: 1.00,
      },
    ],
  },
},
    {
		name: 'Sicilian Special',
		description: 'Pepperoni, salami, Italian sausage, tomato sauce, and mozzarella on hand-tossed dough.',
		photo: sicilian,

		basePrice: {
			Personal: 9.49,
			Medium: 13.49,
			Large: 14.49,
		},

		options: {
			size: [
				'Personal',
				'Medium',
				'Large',
			],

			removeToppings: [
				'Pepperoni',
				'Salami',
				'Italian Sausage',
				'Tomato Sauce',
				'Mozzarella',
			],

			addExtras: [
				{
					name: 'Extra Pepperoni',
					price: 1.50,
				},

				{
					name: 'Extra Salami',
					price: 1.50,
				},

				{
					name: 'Extra Italian Sausage',
					price: 1.50,
				},

				{
					name: 'Extra Mozzarella',
					price: 1.00,
				},
			],
		},
	},

   {
		name: 'Veggie Supreme',
		description: 'Black olives, bell peppers, mushrooms, onions, diced tomatoes, tomato sauce, and mozzarella on hand-tossed dough.',
		photo: veggie,

		basePrice: {
			Personal: 8.99,
			Medium: 12.99,
			Large: 14.49,
		},

		options: {
			size: [
				'Personal',
				'Medium',
				'Large',
			],

			removeToppings: [
				'Black Olives',
				'Bell Peppers',
				'Mushrooms',
				'Onions',
				'Diced Tomatoes',
				'Tomato Sauce',
				'Mozzarella',
			],

			addExtras: [
				{
					name: 'Extra Black Olives',
					price: 1.00,
				},

				{
					name: 'Extra Bell Peppers',
					price: 1.00,
				},

				{
					name: 'Extra Mushrooms',
					price: 1.00,
				},

				{
					name: 'Extra Onions',
					price: 1.00,
				},

				{
					name: 'Extra Diced Tomatoes',
					price: 1.00,
				},

				{
					name: 'Extra Mozzarella',
					price: 1.00,
				},
			],
		},
	},
    
	{
  		name: 'Vegan Veggie',
 	 	description: 'Black olives, bell peppers, mushrooms, onions, diced tomatoes, tomato sauce, and vegan cheese on cauliflower crust.',
  		photo: ewwww,

  		basePrice: {
    		Personal: 8.99,
    		Medium: 12.99,
    		Large: 14.49,
  		},

  		options: {
    		size: [
      			'Personal',
      			'Medium',
      			'Large',
    		],

    		removeToppings: [
      			'Black Olives',
      			'Bell Peppers',
      			'Mushrooms',
      			'Onions',
      			'Diced Tomatoes',
      			'Tomato Sauce',
      			'Vegan Cheese',
    		],

    		addExtras: [
      			{
        			name: 'Extra Black Olives',
        			price: 1.00,
      			},

      			{
        			name: 'Extra Bell Peppers',
        			price: 1.00,
      			},

      			{
        			name: 'Extra Mushrooms',
        			price: 1.00,
      },

      			{
        			name: 'Extra Onions',
        			price: 1.00,
      			},
      
      			{
        			name: 'Extra Diced Tomatoes',
        			price: 1.00,
      			},

      			{
        			name: 'Extra Vegan Cheese',
        			price: 1.00,
      			},
    		],
  		},
	},
]

export default pizzas
