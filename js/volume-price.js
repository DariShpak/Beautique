document
  .getElementById("volume-select")
  .addEventListener("change", function () {
    const price = this.options[this.selectedIndex].dataset.price
    document.querySelector(".item-card-price").textContent = `€${price}`
  })
