(function () {
  try {
    var t = localStorage.getItem("theme");
    var dark = t ? t === "dark" : true;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
