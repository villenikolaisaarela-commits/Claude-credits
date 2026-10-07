// About page: the photo opens from below, the story lights up word by word as you read
(() => {
  const { reduce, lenis, reveal } = window.VS;
  reveal([document.querySelector('.ab-big')]);
  const words = [];
  document.querySelectorAll('.rd').forEach(p => {
    p.innerHTML = p.textContent.split(' ').map(w => `<span class="wd">${w}</span>`).join(' ');
    words.push(...p.querySelectorAll('.wd'));
  });
  const read = () => {
    const line = innerHeight * (reduce ? 1 : 0.68);
    words.forEach(w => w.classList.toggle('on', w.getBoundingClientRect().top < line));
  };
  if (lenis) lenis.on('scroll', read);
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', read);
  read();
})();
