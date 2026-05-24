import specials from './Specials'
import pizzas from './Pizzas'
import wings from './Wings'
import salads from './Salads'
import desserts from './Desserts'
import beverages from './Beverages'

const menuSections = [
  {
    id: 'specials',
    title: 'Specials',
    items: specials,
  },
  {
    id: 'pizzas',
    title: 'Pizzas',
    items: pizzas,
  },
  {
    id: 'wings',
    title: 'Wings',
    items: wings,
  },
  {
    id: 'salads',
    title: 'Salads',
    items: salads,
  },
  {
    id: 'desserts',
    title: 'Desserts',
    items: desserts,
  },
  {
    id: 'beverages',
    title: 'Beverages',
    items: beverages,
  },
]

export default menuSections