const cartBtn = document.querySelector(".open-cart-btn")
const cartSidebar = document.getElementById("cart-sidebar")
const cartOverlay = document.getElementById("cart-overlay")
const closeCartBtn = document.querySelector(".close-cart")

function openCart() {
  cartSidebar.classList.add("open")
  cartOverlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeCart() {
  cartSidebar.classList.remove("open")
  cartOverlay.classList.remove("active")
  document.body.style.overflow = "auto"
}

cartBtn.addEventListener("click", openCart)
closeCartBtn.addEventListener("click", closeCart)
cartOverlay.addEventListener("click", closeCart)
