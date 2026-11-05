import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
export { negocios, categorias } from './datos.js';
export function render(ruta) { return renderToString(<App rutaInicial={ruta} />); }
