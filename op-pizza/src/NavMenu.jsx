import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

function NavMenu({
  isMenuOpen,
  menuAnchorEl,
  isSignedIn,
  onOpen,
  onClose,
  onViewProfile,
  onSignOut,
}) {
  return (
    <>
      <IconButton
        id="category-menu-button"
        className="menu-toggle"
        aria-label="Toggle menu categories"
        aria-controls={isMenuOpen ? 'category-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        onClick={onOpen}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        id="category-menu"
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={onClose}
        MenuListProps={{
          'aria-labelledby': 'category-menu-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component="a" href="#specials" onClick={onClose}>Specials</MenuItem>
        <MenuItem component="a" href="#pizzas" onClick={onClose}>Pizzas</MenuItem>
        <MenuItem component="a" href="#salads" onClick={onClose}>Salads</MenuItem>
        <MenuItem component="a" href="#wings" onClick={onClose}>Wings</MenuItem>
        <MenuItem component="a" href="#beverages" onClick={onClose}>Beverages</MenuItem>
        <MenuItem component="a" href="#desserts" onClick={onClose}>Desserts</MenuItem>
        {isSignedIn && (
          <>
            <MenuItem onClick={onViewProfile}>View Profile</MenuItem>
            <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
          </>
        )}
      </Menu>
    </>
  )
}

export default NavMenu
