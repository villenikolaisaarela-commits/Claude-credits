// Draft request: the form opens an email with the details filled in. Nothing is sent to this site.
(() => {
  const form = document.getElementById('form');
  if (!form) return;
  const note = document.getElementById('form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const reach = form.elements.reach.value.trim();
    const site = form.elements.site.value.trim();
    if (!name) { form.elements.name.focus(); note.textContent = 'Kirjoita ensin nimesi.'; return; }
    if (!reach) { form.elements.reach.focus(); note.textContent = 'Kirjoita sähköposti tai puhelinnumero, niin tiedän, mihin vastaan.'; return; }
    const body = `Hei Ville,\n\nhaluaisin ilmaisen luonnoksen uudesta etusivusta.\n\nNimi: ${name}\nYhteystieto: ${reach}\nNykyiset sivut: ${site || '-'}\n`;
    note.innerHTML = 'Sähköpostiohjelmasi avautuu valmiilla viestillä. Jos se ei avaudu, soita <a href="tel:+358451035362">045 103 5362</a> tai kirjoita osoitteeseen <a href="mailto:info@villesaarela.com">info@villesaarela.com</a>.';
    location.href = `mailto:info@villesaarela.com?subject=${encodeURIComponent('Ilmainen luonnos')}&body=${encodeURIComponent(body)}`;
  });
})();
