document.addEventListener('DOMContentLoaded', function() {
  const dropdown = document.getElementById('volume-dropdown');
  const dropdownSelected = dropdown.querySelector('.dropdown-selected');
  const dropdownOptions = dropdown.querySelectorAll('.dropdown-option');
  const priceElement = document.querySelector('.item-card-price');

  // Toggle dropdown
  dropdownSelected.addEventListener('click', function() {
    dropdown.classList.toggle('open');
  });

  // Handle option selection
  dropdownOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Update selected text
      const selectedText = this.getAttribute('data-value');
      const selectedPrice = this.getAttribute('data-price');
      
      dropdownSelected.querySelector('span').textContent = selectedText;
      dropdownSelected.setAttribute('data-price', selectedPrice);
      
      // Update price
      priceElement.textContent = `€${selectedPrice}`;
      
      // Update active state
      dropdownOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      
      // Close dropdown
      dropdown.classList.remove('open');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
});