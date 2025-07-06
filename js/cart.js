document.addEventListener("DOMContentLoaded", () => {
  let currentLang = "en"
  const langBtn = document.getElementById("lang-toggle")

  langBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "es" : "en"
    langBtn.textContent = currentLang.toUpperCase()
  })
})
