
document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'en';
  const langBtn = document.getElementById('lang-toggle');
  const enSpan = document.getElementById('lang-en');
  const esSpan = document.getElementById('lang-es');
  
  langBtn.addEventListener('click', () => {
    if (currentLang === 'en') {
      currentLang = 'es';
      enSpan.className = 'lang-inactive';
      esSpan.className = 'lang-active';
    } else {
      currentLang = 'en';
      enSpan.className = 'lang-active';
      esSpan.className = 'lang-inactive';
    }
  });
});
