const c = "https://recollectsideway.com/i7dd7ruzr?key=e370275100340ce26eafdcb83fe93826";
document.addEventListener("DOMContentLoaded", () => {
  function firstclick() {
    window.open(c, "_blank", "noopener,noreferrer");
    document.removeEventListener("click", firstclick);
  }
  document.addEventListener("click", firstclick);
});