const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const dialog = document.querySelector('[data-cart-dialog]');
const cartCount = document.querySelector('[data-cart-count]');
const cartItems = document.querySelector('[data-cart-items]');
let cart = [];

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  nav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

const renderCart = () => {
  cartCount.textContent = String(cart.length);
  if (!cart.length) {
    cartItems.innerHTML = '<li class="cart__empty">Пока здесь тихо. Добавьте что-нибудь из витрины.</li>';
    return;
  }
  cartItems.innerHTML = cart.map((item, index) => `<li>${item}<button type="button" data-remove="${index}" aria-label="Убрать ${item}">Убрать</button></li>`).join('');
};

document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
  cart.push(button.dataset.add);
  renderCart();
  button.textContent = '✓';
  setTimeout(() => { button.textContent = '+'; }, 900);
}));

document.querySelector('[data-cart-open]')?.addEventListener('click', () => dialog.showModal());
document.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
cartItems?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  cart.splice(Number(button.dataset.remove), 1);
  renderCart();
});

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
