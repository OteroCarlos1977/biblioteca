import { Toaster } from 'sileo';
import { LibraryPage } from './pages/LibraryPage';
import 'bootstrap/dist/css/bootstrap.min.css';

// App se mantiene minimo: solo renderiza la pagina principal.
// La logica de carga, filtros y visualizacion vive en modulos separados.
function App() {
  return (
    <>
      <Toaster position="top-right" />
      <LibraryPage />
      <footer className="developer-footer" aria-label="Marca de desarrollo">
        <span className="developer-footer-mark">CO</span>
        <span>Desarrollado por Carlos Otero</span>
      </footer>
    </>
  );
}

export default App;
