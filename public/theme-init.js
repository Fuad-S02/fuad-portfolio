// Theme is locked to dark (the toggle was removed). Clears any old saved
// "light" choice so returning visitors aren't stuck in it.
(function () {
  document.documentElement.classList.add("dark");
  try {
    localStorage.removeItem("theme");
  } catch (e) {}
})();
