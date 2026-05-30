function AdminModal({
  options,
  loading,
  error,
  addForm,
  addError,
  addLoading,
  removeId,
  removeLoading,
  onFormChange,
  onPhotoSelected,
  onToggleIngredient,
  onRemoveSelection,
  onSubmitAdd,
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

  return (
    <div className="login-modal" id="admin-modal">
      <div className="login-box" style={{ width: 'min(680px, 92vw)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>Admin</h2>

        <p>Manage menu items with ingredient inputs from the database.</p>

        {loading && <p>Loading admin options...</p>}
        {!loading && error && <p className="login-error">{error}</p>}

        <button onClick={onReload} disabled={loading || addLoading || removeLoading}>Refresh Options</button>

        <h3>Add Menu Item</h3>

        <select
          value={addForm.categoryId}
          onChange={(e) => onFormChange('categoryId', e.target.value)}
          disabled={loading || addLoading}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Item Name"
          value={addForm.itemName}
          onChange={(e) => onFormChange('itemName', e.target.value)}
          disabled={loading || addLoading}
        />

        <input
          type="text"
          placeholder="Description"
          value={addForm.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          disabled={loading || addLoading}
        />

        <label style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>
          Upload Photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPhotoSelected(e.target.files?.[0] || null)}
          disabled={loading || addLoading}
        />
        <p>{selectedPhotoName || 'No photo selected.'}</p>

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Base Price"
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

        <button onClick={onSubmitAdd} disabled={loading || addLoading || removeLoading}>
          {addLoading ? 'Saving...' : 'Add Menu Item'}
        </button>

        <h3>Remove Menu Item</h3>

        <select
          value={removeId}
          onChange={(e) => onRemoveSelection(e.target.value)}
          disabled={loading || addLoading || removeLoading}
        >
          <option value="">Select Menu Item To Remove</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>{item.categoryName} - {item.name}</option>
          ))}
        </select>

        <button onClick={onSubmitRemove} disabled={!removeId || loading || addLoading || removeLoading}>
          {removeLoading ? 'Removing...' : 'Remove Menu Item'}
        </button>

        <button onClick={onClose} disabled={addLoading || removeLoading}>Close</button>
      </div>
    </div>
  )
}

export default AdminModal
