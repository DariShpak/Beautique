class Cart {
  constructor() {
    this.items = this.loadCartFromStorage();
    this.cartSidebar = document.getElementById('cart-sidebar');
    this.cartOverlay = document.getElementById('cart-overlay');
    this.cartItemsContainer = document.getElementById('cart-items');
    this.cartTotal = document.getElementById('cart-total');
    this.cartCounter = document.querySelector('.cart-counter');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartDisplay();
    this.updateCartCounter();
    this.updateButtonStates();
  }

  bindEvents() {
    // Open cart button
    const openCartBtn = document.querySelector('.open-cart-btn');
    if (openCartBtn) {
      openCartBtn.addEventListener('click', () => this.openCart());
    }

    // Close cart button
    const closeCartBtn = document.querySelector('.close-cart');
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => this.closeCart());
    }

    // Close cart when clicking overlay
    if (this.cartOverlay) {
      this.cartOverlay.addEventListener('click', () => this.closeCart());
    }

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });

    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }
  }

  handleAddToCart(e) {
    e.preventDefault();
    
    const button = e.target;
    const productCard = button.closest('.recommend-item') || button.closest('.item-description');
    
    let product;
    
    if (productCard) {
      // Check if we're on item page with dropdown
      const dropdown = document.getElementById('volume-dropdown');
      let selectedVolume = '250ml';
      let selectedPrice = '34.95';
      
      if (dropdown) {
        const selectedOption = dropdown.querySelector('.dropdown-selected');
        selectedVolume = selectedOption.querySelector('span').textContent;
        selectedPrice = selectedOption.getAttribute('data-price');
      }
      
      // Get product details
      const titleElement = productCard.querySelector('.item-card-title') || productCard.querySelector('.item-title');
      const subtitleElement = productCard.querySelector('.item-card-subtitle');
      const priceElement = productCard.querySelector('.item-card-price');
      const imgElement = productCard.querySelector('.item-card-img img') || document.querySelector('.item-photo img');
      
      product = {
        id: this.generateProductId(titleElement?.textContent, selectedVolume),
        title: titleElement?.textContent || 'Product',
        subtitle: subtitleElement?.textContent || 'Brand',
        price: parseFloat(selectedPrice || priceElement?.textContent.replace('€', '') || '0'),
        volume: selectedVolume,
        image: imgElement?.src || './images/shop/default.jpg',
        quantity: 1
      };
    }
    
    if (product) {
      this.addItem(product);
      this.showAddedToCartFeedback(button);
    }
  }

  generateProductId(title, volume) {
    return `${title?.toLowerCase().replace(/\s+/g, '-')}-${volume}`;
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push(product);
    }
    
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.updateCartCounter();
    this.updateButtonStates();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.updateCartCounter();
    this.updateButtonStates();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = newQuantity;
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.updateCartCounter();
        this.updateButtonStates();
      }
    }
  }

  updateCartDisplay() {
    if (!this.cartItemsContainer) return;

    if (this.items.length === 0) {
      this.cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <p class="section-text">Your cart is empty</p>
        </div>
      `;
    } else {
      this.cartItemsContainer.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.title}" width="60" height="60">
          <div class="cart-item-info">
            <h4>${item.title}</h4>
            <p>${item.subtitle} - ${item.volume}</p>
            <p>€${item.price.toFixed(2)}</p>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
            <button class="remove-item" data-id="${item.id}">
              <svg width="16" height="16" viewBox="0 0 28 32">
                <use href="./images/icons/icons.svg#icon-recycle-bin-line-icon"></use>
              </svg>
            </button>
          </div>
        </div>
      `).join('');

      // Bind events for cart item controls
      this.bindCartItemEvents();
    }

    this.updateCartTotal();
  }

  bindCartItemEvents() {
    // Increase quantity buttons
    const increaseButtons = this.cartItemsContainer.querySelectorAll('.increase-qty');
    increaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const item = this.items.find(item => item.id === productId);
        if (item) {
          this.updateQuantity(productId, item.quantity + 1);
        }
      });
    });

    // Decrease quantity buttons
    const decreaseButtons = this.cartItemsContainer.querySelectorAll('.decrease-qty');
    decreaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const item = this.items.find(item => item.id === productId);
        if (item) {
          this.updateQuantity(productId, item.quantity - 1);
        }
      });
    });

    // Remove item buttons
    const removeButtons = this.cartItemsContainer.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        this.removeItem(productId);
      });
    });
  }

  updateCartTotal() {
    const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (this.cartTotal) {
      this.cartTotal.textContent = `€${total.toFixed(2)}`;
    }
  }

  updateCartCounter() {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (this.cartCounter) {
      if (totalItems > 0) {
        this.cartCounter.textContent = totalItems;
        this.cartCounter.style.display = 'flex';
      } else {
        this.cartCounter.style.display = 'none';
      }
    }
  }

  openCart() {
    if (this.cartSidebar && this.cartOverlay) {
      this.cartSidebar.classList.add('open');
      this.cartOverlay.classList.add('active');
      document.body.classList.add('lock-scroll');
    }
  }

  closeCart() {
    if (this.cartSidebar && this.cartOverlay) {
      this.cartSidebar.classList.remove('open');
      this.cartOverlay.classList.remove('active');
      document.body.classList.remove('lock-scroll');
    }
  }

  handleCheckout() {
    if (this.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Simple checkout simulation
    const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    alert(`Order Total: €${total.toFixed(2)}\n\nThank you for your order! This is a demo checkout.`);
    
    // Clear cart after checkout
    this.clearCart();
  }

  clearCart() {
    this.items = [];
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.updateCartCounter();
    this.updateButtonStates();
    this.closeCart();
  }

  showAddedToCartFeedback(button) {
    console.log('Cart feedback triggered for button:', button);
    
    // Change button text to "In Cart"
    button.textContent = 'In Cart';
    
    // Add a class to indicate item is in cart
    button.classList.add('in-cart');
    
    // Store the button reference for later updates
    button.setAttribute('data-cart-state', 'in-cart');
  }
  
  updateButtonStates() {
    // Update all add-to-cart buttons to show correct state
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      const productCard = button.closest('.recommend-item') || button.closest('.item-description');
      
      if (productCard) {
        // Get product details to check if it's in cart
        let selectedVolume = '250ml';
        const dropdown = document.getElementById('volume-dropdown');
        if (dropdown) {
          const selectedOption = dropdown.querySelector('.dropdown-selected');
          selectedVolume = selectedOption.querySelector('span').textContent;
        }
        
        const titleElement = productCard.querySelector('.item-card-title') || productCard.querySelector('.item-title');
        const productId = this.generateProductId(titleElement?.textContent, selectedVolume);
        
        const itemInCart = this.items.find(item => item.id === productId);
        
        if (itemInCart) {
          button.textContent = 'In Cart';
          button.classList.add('in-cart');
          button.setAttribute('data-cart-state', 'in-cart');
        } else {
          button.textContent = 'Add to Cart';
          button.classList.remove('in-cart');
          button.removeAttribute('data-cart-state');
        }
      }
    });
  }

  saveCartToStorage() {
    try {
      localStorage.setItem('beautique-cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('beautique-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  }

  // Public methods for external use
  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();
});

// Export for module use
export default Cart;