class AdminPanel {
  constructor() {
    this.products = this.loadProductsFromStorage();
    this.variantCount = 1;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateProductsTable();
    this.generateSKU();
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Add variant button
    const addVariantBtn = document.getElementById('add-variant-btn');
    if (addVariantBtn) {
      addVariantBtn.addEventListener('click', () => this.addVariant());
    }

    // Form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
    }

    // File input previews
    const mainImageInput = document.getElementById('main-image');
    if (mainImageInput) {
      mainImageInput.addEventListener('change', (e) => this.handleImagePreview(e, 'main-image-preview'));
    }

    const galleryImagesInput = document.getElementById('gallery-images');
    if (galleryImagesInput) {
      galleryImagesInput.addEventListener('change', (e) => this.handleImagePreview(e, 'gallery-images-preview', true));
    }

    // Auto-generate SKU
    const productNameInput = document.getElementById('product-name');
    const brandInput = document.getElementById('brand');
    if (productNameInput && brandInput) {
      productNameInput.addEventListener('input', () => this.generateSKU());
      brandInput.addEventListener('input', () => this.generateSKU());
    }

    // Preview and draft buttons
    const previewBtn = document.getElementById('preview-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    
    if (previewBtn) {
      previewBtn.addEventListener('click', () => this.previewProduct());
    }
    
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => this.saveDraft());
    }

    // Filters
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const searchProducts = document.getElementById('search-products');

    if (filterCategory) {
      filterCategory.addEventListener('change', () => this.filterProducts());
    }
    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.filterProducts());
    }
    if (searchProducts) {
      searchProducts.addEventListener('input', () => this.filterProducts());
    }
  }

  handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    
    // Hide all panels
    const panels = document.querySelectorAll('.admin-panel');
    panels.forEach(panel => {
      panel.style.display = 'none';
    });
    
    // Show target panel
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
      link.classList.remove('admin-nav-link-active');
    });
    e.target.classList.add('admin-nav-link-active');
  }

  addVariant() {
    this.variantCount++;
    const variantsContainer = document.getElementById('variants-container');
    const variantHTML = `
      <div class="admin-variant">
        <div class="admin-form-row">
          <div class="form-group">
            <label for="variant-volume-${this.variantCount}" class="form-label">Volume *</label>
            <input 
              type="text" 
              id="variant-volume-${this.variantCount}" 
              name="variants[${this.variantCount - 1}][volume]" 
              class="form-input" 
              required
              placeholder="e.g., 500ml"
            />
          </div>
          <div class="form-group">
            <label for="variant-price-${this.variantCount}" class="form-label">Price (€) *</label>
            <input 
              type="number" 
              id="variant-price-${this.variantCount}" 
              name="variants[${this.variantCount - 1}][price]" 
              class="form-input" 
              step="0.01"
              min="0"
              required
              placeholder="59.95"
            />
          </div>
          <div class="form-group">
            <label for="variant-stock-${this.variantCount}" class="form-label">Stock Quantity</label>
            <input 
              type="number" 
              id="variant-stock-${this.variantCount}" 
              name="variants[${this.variantCount - 1}][stock]" 
              class="form-input" 
              min="0"
              placeholder="50"
            />
          </div>
          <div class="form-group admin-variant-actions">
            <button type="button" class="admin-btn admin-btn-danger remove-variant-btn">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
    
    variantsContainer.insertAdjacentHTML('beforeend', variantHTML);
    
    // Bind remove button
    const removeBtn = variantsContainer.querySelector('.admin-variant:last-child .remove-variant-btn');
    removeBtn.addEventListener('click', (e) => this.removeVariant(e));
    
    // Show remove buttons if more than one variant
    if (this.variantCount > 1) {
      const removeButtons = document.querySelectorAll('.remove-variant-btn');
      removeButtons.forEach(btn => {
        btn.style.display = 'block';
      });
    }
  }

  removeVariant(e) {
    const variant = e.target.closest('.admin-variant');
    variant.remove();
    this.variantCount--;
    
    // Hide remove buttons if only one variant left
    if (this.variantCount === 1) {
      const removeButtons = document.querySelectorAll('.remove-variant-btn');
      removeButtons.forEach(btn => {
        btn.style.display = 'none';
      });
    }
  }

  handleImagePreview(e, previewId, multiple = false) {
    const files = e.target.files;
    const previewContainer = document.getElementById(previewId);
    
    if (!multiple) {
      previewContainer.innerHTML = '';
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        previewItem.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        previewContainer.appendChild(previewItem);
      };
      
      reader.readAsDataURL(file);
    }
  }

  generateSKU() {
    const productName = document.getElementById('product-name').value;
    const brand = document.getElementById('brand').value;
    const skuInput = document.getElementById('sku');
    
    if (productName && brand) {
      const sku = (brand.substring(0, 3) + productName.substring(0, 3) + Date.now().toString().slice(-4))
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      skuInput.value = sku;
    }
  }

  handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const product = {
      id: Date.now().toString(),
      name: formData.get('productName'),
      brand: formData.get('brand'),
      category: formData.get('category'),
      status: formData.get('status'),
      description: formData.get('description'),
      ingredients: formData.get('ingredients'),
      usage: formData.get('usage'),
      sku: formData.get('sku'),
      weight: formData.get('weight'),
      variants: [],
      images: {
        main: null,
        gallery: []
      },
      createdAt: new Date().toISOString()
    };

    // Process variants
    const variants = [];
    let variantIndex = 0;
    
    while (formData.get(`variants[${variantIndex}][volume]`)) {
      variants.push({
        volume: formData.get(`variants[${variantIndex}][volume]`),
        price: parseFloat(formData.get(`variants[${variantIndex}][price]`)),
        stock: parseInt(formData.get(`variants[${variantIndex}][stock]`)) || 0
      });
      variantIndex++;
    }
    
    product.variants = variants;

    // Process images (in a real app, you'd upload to a server)
    const mainImageFile = formData.get('mainImage');
    const galleryImageFiles = formData.getAll('galleryImages');
    
    if (mainImageFile && mainImageFile.size > 0) {
      product.images.main = URL.createObjectURL(mainImageFile);
    }
    
    galleryImageFiles.forEach(file => {
      if (file.size > 0) {
        product.images.gallery.push(URL.createObjectURL(file));
      }
    });

    // Add to products array
    this.products.push(product);
    this.saveProductsToStorage();
    this.updateProductsTable();
    
    // Show success message
    alert('Product added successfully!');
    
    // Reset form
    e.target.reset();
    this.variantCount = 1;
    document.getElementById('variants-container').innerHTML = `
      <div class="admin-variant">
        <div class="admin-form-row">
          <div class="form-group">
            <label for="variant-volume-1" class="form-label">Volume *</label>
            <input 
              type="text" 
              id="variant-volume-1" 
              name="variants[0][volume]" 
              class="form-input" 
              required
              placeholder="e.g., 250ml"
            />
          </div>
          <div class="form-group">
            <label for="variant-price-1" class="form-label">Price (€) *</label>
            <input 
              type="number" 
              id="variant-price-1" 
              name="variants[0][price]" 
              class="form-input" 
              step="0.01"
              min="0"
              required
              placeholder="34.95"
            />
          </div>
          <div class="form-group">
            <label for="variant-stock-1" class="form-label">Stock Quantity</label>
            <input 
              type="number" 
              id="variant-stock-1" 
              name="variants[0][stock]" 
              class="form-input" 
              min="0"
              placeholder="100"
            />
          </div>
          <div class="form-group admin-variant-actions">
            <button type="button" class="admin-btn admin-btn-danger remove-variant-btn" style="display: none;">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Clear image previews
    document.getElementById('main-image-preview').innerHTML = '';
    document.getElementById('gallery-images-preview').innerHTML = '';
    
    this.generateSKU();
  }

  previewProduct() {
    const form = document.getElementById('add-product-form');
    const formData = new FormData(form);
    
    const product = {
      name: formData.get('productName'),
      brand: formData.get('brand'),
      category: formData.get('category'),
      description: formData.get('description'),
      variants: []
    };

    // Get variants
    let variantIndex = 0;
    while (formData.get(`variants[${variantIndex}][volume]`)) {
      product.variants.push({
        volume: formData.get(`variants[${variantIndex}][volume]`),
        price: parseFloat(formData.get(`variants[${variantIndex}][price]`))
      });
      variantIndex++;
    }

    // Create preview modal (simplified)
    const previewHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 32px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
          <h3>${product.name}</h3>
          <p><strong>Brand:</strong> ${product.brand}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Description:</strong> ${product.description}</p>
          <div><strong>Variants:</strong></div>
          ${product.variants.map(v => `<div>- ${v.volume}: €${v.price}</div>`).join('')}
          <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #6b5c4c; color: white; border: none; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', previewHTML);
  }

  saveDraft() {
    const form = document.getElementById('add-product-form');
    const formData = new FormData(form);
    
    const draft = {};
    for (let [key, value] of formData.entries()) {
      draft[key] = value;
    }
    
    localStorage.setItem('beautique-product-draft', JSON.stringify(draft));
    alert('Draft saved successfully!');
  }

  updateProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    if (this.products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">No products found</td></tr>';
      return;
    }

    tableBody.innerHTML = this.products.map(product => `
      <tr>
        <td>
          ${product.images.main ? `<img src="${product.images.main}" alt="${product.name}" class="admin-product-image">` : '—'}
        </td>
        <td>${product.name}</td>
        <td>${product.brand}</td>
        <td>${product.category}</td>
        <td>€${Math.min(...product.variants.map(v => v.price)).toFixed(2)} - €${Math.max(...product.variants.map(v => v.price)).toFixed(2)}</td>
        <td>${product.variants.reduce((sum, v) => sum + v.stock, 0)}</td>
        <td><span class="admin-product-status ${product.status}">${product.status}</span></td>
        <td>
          <button class="admin-btn admin-btn-secondary" onclick="adminPanel.editProduct('${product.id}')">Edit</button>
          <button class="admin-btn admin-btn-danger" onclick="adminPanel.deleteProduct('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  filterProducts() {
    const category = document.getElementById('filter-category').value;
    const status = document.getElementById('filter-status').value;
    const search = document.getElementById('search-products').value.toLowerCase();

    let filteredProducts = this.products;

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.sku.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search)
      );
    }

    this.displayFilteredProducts(filteredProducts);
  }

  displayFilteredProducts(products) {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    if (products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">No products match your criteria</td></tr>';
      return;
    }

    tableBody.innerHTML = products.map(product => `
      <tr>
        <td>
          ${product.images.main ? `<img src="${product.images.main}" alt="${product.name}" class="admin-product-image">` : '—'}
        </td>
        <td>${product.name}</td>
        <td>${product.brand}</td>
        <td>${product.category}</td>
        <td>€${Math.min(...product.variants.map(v => v.price)).toFixed(2)} - €${Math.max(...product.variants.map(v => v.price)).toFixed(2)}</td>
        <td>${product.variants.reduce((sum, v) => sum + v.stock, 0)}</td>
        <td><span class="admin-product-status ${product.status}">${product.status}</span></td>
        <td>
          <button class="admin-btn admin-btn-secondary" onclick="adminPanel.editProduct('${product.id}')">Edit</button>
          <button class="admin-btn admin-btn-danger" onclick="adminPanel.deleteProduct('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  editProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Switch to add product panel
    document.getElementById('add-product').style.display = 'block';
    document.getElementById('manage-products').style.display = 'none';
    
    // Update navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
      link.classList.remove('admin-nav-link-active');
    });
    document.querySelector('[href="#add-product"]').classList.add('admin-nav-link-active');

    // Populate form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('brand').value = product.brand;
    document.getElementById('category').value = product.category;
    document.getElementById('status').value = product.status;
    document.getElementById('description').value = product.description;
    document.getElementById('ingredients').value = product.ingredients || '';
    document.getElementById('usage').value = product.usage || '';
    document.getElementById('sku').value = product.sku;
    document.getElementById('weight').value = product.weight || '';

    // Populate variants
    const variantsContainer = document.getElementById('variants-container');
    variantsContainer.innerHTML = '';
    
    product.variants.forEach((variant, index) => {
      const variantHTML = `
        <div class="admin-variant">
          <div class="admin-form-row">
            <div class="form-group">
              <label for="variant-volume-${index + 1}" class="form-label">Volume *</label>
              <input 
                type="text" 
                id="variant-volume-${index + 1}" 
                name="variants[${index}][volume]" 
                class="form-input" 
                value="${variant.volume}"
                required
              />
            </div>
            <div class="form-group">
              <label for="variant-price-${index + 1}" class="form-label">Price (€) *</label>
              <input 
                type="number" 
                id="variant-price-${index + 1}" 
                name="variants[${index}][price]" 
                class="form-input" 
                step="0.01"
                min="0"
                value="${variant.price}"
                required
              />
            </div>
            <div class="form-group">
              <label for="variant-stock-${index + 1}" class="form-label">Stock Quantity</label>
              <input 
                type="number" 
                id="variant-stock-${index + 1}" 
                name="variants[${index}][stock]" 
                class="form-input" 
                min="0"
                value="${variant.stock}"
              />
            </div>
            <div class="form-group admin-variant-actions">
              <button type="button" class="admin-btn admin-btn-danger remove-variant-btn" ${product.variants.length === 1 ? 'style="display: none;"' : ''}>
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
      variantsContainer.insertAdjacentHTML('beforeend', variantHTML);
    });

    this.variantCount = product.variants.length;

    // Update form submission to handle editing
    const form = document.getElementById('add-product-form');
    form.setAttribute('data-editing', productId);
    
    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Product';
  }

  deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== productId);
      this.saveProductsToStorage();
      this.updateProductsTable();
    }
  }

  saveProductsToStorage() {
    try {
      localStorage.setItem('beautique-admin-products', JSON.stringify(this.products));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
    }
  }

  loadProductsFromStorage() {
    try {
      const saved = localStorage.getItem('beautique-admin-products');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      return [];
    }
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminPanel = new AdminPanel();
});

export default AdminPanel;