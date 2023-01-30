
/* AOS.init(); */

// HEADER FUNCION

// obtener el header
const header = document.querySelector('#site-header');

// agregar un listener al evento scroll del window
window.addEventListener('scroll', function() {

    
    
  // si la posición del scroll es mayor a 100 píxeles
  if (window.scrollY > 100) {
    // mostrar el header
    header.classList.add('show');
  } else {
    // ocultar el header
    header.classList.remove('show');
  }
});



