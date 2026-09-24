const toggle = document.querySelector(".nav-toggle");
const mobile = document.querySelector(".nav-mobile");
if (toggle && mobile) {
  toggle.addEventListener("click", () => {
    const open = !mobile.hasAttribute("hidden");
    if (open) {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Apri menu");
    } else {
      mobile.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Chiudi menu");
    }
  });
  mobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Apri menu");
    });
  });
}
