import traditional from '../assets/traditional.jpg'
import boneless from '../assets/boneless.jpg'

const wings = [
  {
    name: 'Traditional Wings',
    description: 'Ten crispy wings tossed in your choice of sauce. Every 5 wings comes with option to choose another sauce and dip.',
    price: '$12.99',
    photo: traditional,

    options: {
      sauceOne: [
        'Buffalo',
        'BBQ',
        'Garlic Parmesan',
        'Honey Mustard',
        'Mango Habanero',
        'Lemon Pepper',
      ],

      sauceTwo: [
        'Buffalo',
        'BBQ',
        'Garlic Parmesan',
        'Honey Mustard',
        'Mango Habanero',
        'Lemon Pepper',
      ],

      dip: [
        'Ranch',
        'Blue Cheese',
        'No Dip',
      ],

      extraDips: [
        {
          name: 'Extra Ranch',
          price: 0.75,
        },
        {
          name: 'Extra Blue Cheese',
          price: 0.75,
        },
      ],
    },
  },

  {
    name: 'Boneless Wings',
    description: 'Ten crispy boneless wings tossed in your choice of sauce. Every 5 wings comes with option to choose another sauce and dip.',
    price: '$13.49',
    photo: boneless,

    options: {
      sauceOne: [
        'Buffalo',
        'BBQ',
        'Garlic Parmesan',
        'Honey Mustard',
        'Mango Habanero',
        'Lemon Pepper',
      ],

      sauceTwo: [
        'Buffalo',
        'BBQ',
        'Garlic Parmesan',
        'Honey Mustard',
        'Mango Habanero',
        'Lemon Pepper',
      ],


      dip: [
        'Ranch',
        'Blue Cheese',
        'No Dip',
      ],

      extraDips: [
        {
          name: 'Extra Ranch',
          price: 0.75,
        },
        {
          name: 'Extra Blue Cheese',
          price: 0.75,
        },
      ],
    },
  }
]

export default wings