import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

function NavMenu({
  isMenuOpen,
  menuAnchorEl,
  menuSections,
  isSignedIn,
  accountType,
  canAccessAdminMenu,
  onOpen,
  onClose,
  onViewProfile,
  onOpenAdmin,
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
        {(menuSections || []).map((section) => (
          <MenuItem key={section.id} component="a" href={`#${section.id}`} onClick={onClose}>
            {section.title}
          </MenuItem>
        ))}
        {isSignedIn && accountType === 'employee' && (
          <>
            <MenuItem
              onClick={canAccessAdminMenu ? onOpenAdmin : undefined}
              disabled={!canAccessAdminMenu}
            >
              Admin
            </MenuItem>
            <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
          </>
        )}
        {isSignedIn && accountType !== 'employee' && (
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
