import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

function AdminModal({
  options,
  loading,
  error,
  addForm,
  addError,
  addLoading,
  editForm,
  editLoading,
  removeId,
  removeLoading,
  onFormChange,
  onPhotoSelected,
  onToggleIngredient,
  onEditFormChange,
  onRemoveSelection,
  onSubmitAdd,
  onSubmitEdit,
  onSubmitRemove,
  onReload,
  onClose,
  selectedPhotoName,
}) {
  const categories = options?.categories || []
  const ingredientItems = options?.ingredientItems || []
  const categoryIngredients = options?.categoryIngredients || []
  const menuItems = options?.menuItems || []
  const selectedCategoryId = Number(addForm.categoryId)
  const allowedIngredientIds = new Set(
    categoryIngredients
      .filter((item) => item.categoryId === selectedCategoryId)
      .map((item) => item.ingredientId)
  )
  const filteredIngredients = selectedCategoryId
    ? ingredientItems.filter((item) => allowedIngredientIds.has(item.id))
    : []

  useEscapeToClose(onClose)

  return (
    <ModalShell
      overlayId="admin-modal"
      ariaLabelledBy="admin-modal-title"
      boxStyle={{ width: 'min(680px, 92vw)', maxHeight: '90vh', overflowY: 'auto' }}
    >
        <h2 id="admin-modal-title">Admin</h2>

        <p>Manage menu items with ingredient inputs from the database.</p>

        {loading && <p>Loading admin options...</p>}
        {!loading && error && <p className="login-error">{error}</p>}

        <button onClick={onReload} disabled={loading || addLoading || editLoading || removeLoading}>Refresh Options</button>

        <h3>Add Menu Item</h3>

        <label htmlFor="admin-category" className="input-label">Category</label>
        <select
          id="admin-category"
          value={addForm.categoryId}
          onChange={(e) => onFormChange('categoryId', e.target.value)}
          disabled={loading || addLoading}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>

        <label htmlFor="admin-item-name" className="input-label">Item Name</label>
        <input
          id="admin-item-name"
          type="text"
          value={addForm.itemName}
          onChange={(e) => onFormChange('itemName', e.target.value)}
          disabled={loading || addLoading}
        />

        <label htmlFor="admin-description" className="input-label">Description</label>
        <input
          id="admin-description"
          type="text"
          value={addForm.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          disabled={loading || addLoading}
        />

        <label htmlFor="admin-photo" style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>
          Upload Photo
        </label>
        <input
          id="admin-photo"
          type="file"
          accept="image/*"
          onChange={(e) => onPhotoSelected(e.target.files?.[0] || null)}
          disabled={loading || addLoading}
        />
        <p>{selectedPhotoName || 'No photo selected.'}</p>

        <label htmlFor="admin-base-price" className="input-label">Base Price</label>
        <input
          id="admin-base-price"
          type="number"
          min="0.01"
          step="0.01"
          value={addForm.basePrice}
          onChange={(e) => onFormChange('basePrice', e.target.value)}
          disabled={loading || addLoading}
        />

        <p><strong>Required Ingredients</strong></p>
        {!selectedCategoryId && <p>Select a category to view ingredient options.</p>}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
          {filteredIngredients.map((item) => {
            const checked = addForm.ingredientIds.includes(item.id)
            return (
              <label key={item.id} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleIngredient(item.id)}
                  disabled={loading || addLoading}
                />{' '}
                {item.name}
              </label>
            )
          })}
          {selectedCategoryId && filteredIngredients.length === 0 && (
            <p>No ingredients configured for this category.</p>
          )}
        </div>

        {addError && <p className="login-error">{addError}</p>}

        <button onClick={onSubmitAdd} disabled={loading || addLoading || editLoading || removeLoading}>
          {addLoading ? 'Saving...' : 'Add Menu Item'}
        </button>

        <h3>Edit Menu Item</h3>

        <label htmlFor="admin-edit-item" className="input-label">Menu Item To Edit</label>
        <select
          id="admin-edit-item"
          value={editForm.menuItemId}
          onChange={(e) => onEditFormChange('menuItemId', e.target.value)}
          disabled={loading || addLoading || editLoading || removeLoading}
        >
          <option value="">Select Menu Item To Edit</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>{item.categoryName} - {item.name}</option>
          ))}
        </select>

        <label htmlFor="admin-edit-name" className="input-label">New Name (optional)</label>
        <input
          id="admin-edit-name"
          type="text"
          value={editForm.itemName}
          onChange={(e) => onEditFormChange('itemName', e.target.value)}
          disabled={loading || addLoading || editLoading || removeLoading}
        />

        <label htmlFor="admin-edit-description" className="input-label">New Description (optional)</label>
        <input
          id="admin-edit-description"
          type="text"
          value={editForm.description}
          onChange={(e) => onEditFormChange('description', e.target.value)}
          disabled={loading || addLoading || editLoading || removeLoading}
        />

        <label htmlFor="admin-edit-base-price" className="input-label">New Base Price (optional)</label>
        <input
          id="admin-edit-base-price"
          type="number"
          min="0.01"
          step="0.01"
          value={editForm.basePrice}
          onChange={(e) => onEditFormChange('basePrice', e.target.value)}
          disabled={loading || addLoading || editLoading || removeLoading}
        />

        <button onClick={onSubmitEdit} disabled={!editForm.menuItemId || loading || addLoading || editLoading || removeLoading}>
          {editLoading ? 'Updating...' : 'Update Menu Item'}
        </button>

        <h3>Remove Menu Item</h3>

        <label htmlFor="admin-remove-item" className="input-label">Menu Item To Remove</label>
        <select
          id="admin-remove-item"
          value={removeId}
          onChange={(e) => onRemoveSelection(e.target.value)}
          disabled={loading || addLoading || editLoading || removeLoading}
        >
          <option value="">Select Menu Item To Remove</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>{item.categoryName} - {item.name}</option>
          ))}
        </select>

        <button onClick={onSubmitRemove} disabled={!removeId || loading || addLoading || editLoading || removeLoading}>
          {removeLoading ? 'Removing...' : 'Remove Menu Item'}
        </button>

        <button onClick={onClose} disabled={addLoading || editLoading || removeLoading}>Close</button>
    </ModalShell>
  )
}

export default AdminModal
