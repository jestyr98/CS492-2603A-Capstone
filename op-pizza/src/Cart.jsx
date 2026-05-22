import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';

function CartIcon({ itemCount, onClick }) {
  return (
    <IconButton
      aria-label={`Cart, ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      onClick={onClick}
      color="inherit"
    >
      <Badge badgeContent={itemCount} color="error" showZero={false}>
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  )
}

export default CartIcon
