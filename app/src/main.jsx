import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './estilos.css';
const raiz=document.getElementById('root');
// El HTML previo permite explorar e indexar el contenido sin JavaScript.
// El cliente monta su estado propio al cargar para admitir filtros compartidos,
// favoritos y fichas guardadas en este navegador sin diferencias de hidratación.
createRoot(raiz).render(<App rutaInicial={window.location.pathname+window.location.search} />);
