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
      boxClassName="login-box admin-box"
    >
        <h2 id="admin-modal-title">Admin</h2>

        <p className="admin-intro">Manage menu items with ingredient inputs from the database.</p>

        {loading && <p>Loading admin options...</p>}
        {!loading && error && <p className="login-error">{error}</p>}

        <button
          type="button"
          className="admin-secondary-button"
          onClick={onReload}
          disabled={loading || addLoading || editLoading || removeLoading}
        >
          Refresh Options
        </button>

        <details className="admin-section" open>
          <summary className="admin-section-summary">Add Menu Item</summary>
          <div className="admin-section-body">

          <label htmlFor="admin-category" className="input-label">Category</label>
          <select
            id="admin-category"
            className="admin-input"
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
            className="admin-input"
            type="text"
            value={addForm.itemName}
            onChange={(e) => onFormChange('itemName', e.target.value)}
            disabled={loading || addLoading}
          />

          <label htmlFor="admin-description" className="input-label">Description</label>
          <input
            id="admin-description"
            className="admin-input"
            type="text"
            value={addForm.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            disabled={loading || addLoading}
          />

          <label htmlFor="admin-photo" className="input-label">Upload Photo</label>
          <input
            id="admin-photo"
            className="admin-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => onPhotoSelected(e.target.files?.[0] || null)}
            disabled={loading || addLoading}
          />
          <p className="admin-photo-name">{selectedPhotoName || 'No photo selected.'}</p>

          <label htmlFor="admin-base-price" className="input-label">Base Price</label>
          <input
            id="admin-base-price"
            className="admin-input"
            type="number"
            min="0.01"
            step="0.01"
            value={addForm.basePrice}
            onChange={(e) => onFormChange('basePrice', e.target.value)}
            disabled={loading || addLoading}
          />

          <p className="admin-subtitle"><strong>Required Ingredients</strong></p>
          {!selectedCategoryId && <p className="admin-help">Select a category to view ingredient options.</p>}
          <div className="admin-ingredient-list">
            {filteredIngredients.map((item) => {
              const checked = addForm.ingredientIds.includes(item.id)
              return (
                <label key={item.id} className="admin-ingredient-option">
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
              <p className="admin-help">No ingredients configured for this category.</p>
            )}
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={onSubmitAdd}
            disabled={loading || addLoading || editLoading || removeLoading}
          >
            {addLoading ? 'Saving...' : 'Add Menu Item'}
          </button>
          </div>
        </details>

        {addError && <p className="login-error">{addError}</p>}

        <details className="admin-section">
          <summary className="admin-section-summary">Edit Menu Item</summary>
          <div className="admin-section-body">

          <label htmlFor="admin-edit-item" className="input-label">Menu Item To Edit</label>
          <select
            id="admin-edit-item"
            className="admin-input"
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
            className="admin-input"
            type="text"
            value={editForm.itemName}
            onChange={(e) => onEditFormChange('itemName', e.target.value)}
            disabled={loading || addLoading || editLoading || removeLoading}
          />

          <label htmlFor="admin-edit-description" className="input-label">New Description (optional)</label>
          <input
            id="admin-edit-description"
            className="admin-input"
            type="text"
            value={editForm.description}
            onChange={(e) => onEditFormChange('description', e.target.value)}
            disabled={loading || addLoading || editLoading || removeLoading}
          />

          <label htmlFor="admin-edit-base-price" className="input-label">New Base Price (optional)</label>
          <input
            id="admin-edit-base-price"
            className="admin-input"
            type="number"
            min="0.01"
            step="0.01"
            value={editForm.basePrice}
            onChange={(e) => onEditFormChange('basePrice', e.target.value)}
            disabled={loading || addLoading || editLoading || removeLoading}
          />

          <button
            type="button"
            className="admin-primary-button"
            onClick={onSubmitEdit}
            disabled={!editForm.menuItemId || loading || addLoading || editLoading || removeLoading}
          >
            {editLoading ? 'Updating...' : 'Update Menu Item'}
          </button>
          </div>
        </details>

        <details className="admin-section">
          <summary className="admin-section-summary">Remove Menu Item</summary>
          <div className="admin-section-body">

          <label htmlFor="admin-remove-item" className="input-label">Menu Item To Remove</label>
          <select
            id="admin-remove-item"
            className="admin-input"
            value={removeId}
            onChange={(e) => onRemoveSelection(e.target.value)}
            disabled={loading || addLoading || editLoading || removeLoading}
          >
            <option value="">Select Menu Item To Remove</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>{item.categoryName} - {item.name}</option>
            ))}
          </select>

          <button
            type="button"
            className="admin-danger-button"
            onClick={onSubmitRemove}
            disabled={!removeId || loading || addLoading || editLoading || removeLoading}
          >
            {removeLoading ? 'Removing...' : 'Remove Menu Item'}
          </button>
          </div>
        </details>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={onClose}
          disabled={addLoading || editLoading || removeLoading}
        >
          Close
        </button>
    </ModalShell>
  )
}

export default AdminModal
