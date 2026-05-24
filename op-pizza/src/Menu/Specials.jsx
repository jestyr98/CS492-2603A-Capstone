import pizzaDrink from '../assets/twoPizzaDrink.jpg'
import combo from '../assets/combo.jpg'
const specials = [
	{
    name: 'Daily Lunch Special',
    description: 'Two slices of pizza and a beverage for a special price, available Monday through Friday from 11am to 2pm.',
    price: '$9.99',
    photo: pizzaDrink,

    options: {
        sliceOne: [
            'Operation Supreme',
            'Margherita Classic',
            'Caprese Delight',
            'Sicilian Special',
            'Veggie Supreme',
            'Vegan Veggie',
        ],

        sliceTwo: [
            'Operation Supreme',
            'Margherita Classic',
            'Caprese Delight',
            'Sicilian Special',
            'Veggie Supreme',
            'Vegan Veggie',
        ],

        drink: [
            'Sparkling Citrus Soda',
            'Sweet Tea',
            'Coke Classic',
            'Diet Coke',
            'Dr Pepper',
            'Big Red',
        ],
    },
},
	{
        name: 'Combo Deal',
        description: 'Pizza, wings, and a beverage combo at a special price.',
        price: '$24.99',
        photo: combo,

        options: {
        pizzaChoice: [
            'Operation Supreme',
            'Margherita Classic',
            'Caprese Delight',
            'Sicilian Special',
            'Veggie Supreme',
            'Vegan Veggie',
        ],

        wingChoice: [
            'Traditional Wings',
            'Boneless Wings',
        ],

        beverageChoice: [
            'Sparkling Citrus Soda',
            'Sweet Tea',
            'Coke Classic',
            'Diet Coke',
            'Dr Pepper',
            'Big Red',
        ],
    },
},
]

export default specials
