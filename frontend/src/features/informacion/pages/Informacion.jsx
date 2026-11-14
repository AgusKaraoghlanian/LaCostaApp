import { ArrowRight, CircleHelp } from 'lucide-react'
import { Link } from 'react-router'
import { FOTO_PORTADA } from '../../../shared/costa.js'
import Migas from '../../../shared/components/Migas.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'

const PASOS = [
  [
    '01',
    'Buscá a tu manera',
    'Elegí lo que tenés ganas de comer y por dónde querés ir. Los filtros te ayudan a encontrar un lugar para cada plan.',
  ],
  [
    '02',
    'Conocé cada propuesta',
    'Mirá la carta, los servicios y los horarios de cada lugar. Guardá tus favoritos para volver a encontrarlos.',
  ],
  [
    '03',
    'Contactá al lugar',
    'Usá los canales que publicó el negocio (teléfono, WhatsApp o su web) para consultar o reservar.',
  ],
]

// "Nuestra Costa" (tipo costa) y "Cómo funciona" (tipo funciona).
const Informacion = ({ tipo }) => {
  const costa = tipo === 'costa'

  return (
    <main className="contenedor pagina">
      <TituloDePagina titulo={costa ? 'Nuestra Costa' : 'Cómo funciona'} />
      <Migas items={[{ texto: costa ? 'Nuestra Costa' : 'Cómo funciona' }]} />
      <div className="pagina-editorial">
        <span className="sobretitulo">HECHO CON AMOR POR LO LOCAL</span>
        <h1>
          {costa ? (
            <>
              El mar nos reúne.
              <br />
              La mesa, también.
            </>
          ) : (
            'Un buen plan empieza acá.'
          )}
        </h1>
        <p className="bajada">
          {costa
            ? 'Un directorio para descubrir los sabores del Partido de La Costa, sus localidades y las historias que se cocinan en cada rincón.'
            : 'Encontrá tu próximo lugar favorito, guardalo para después y conectá con su propuesta.'}
        </p>
        {costa ? (
          <>
            <img className="foto-editorial" src={FOTO_PORTADA} alt="Un espacio gastronómico cálido y luminoso" />
            <h2>Mucho más que una escapada</h2>
            <p>
              Desde San Clemente del Tuyú hasta Costa Esmeralda, La Costa tiene cafés para una tarde de lluvia,
              mesas para una celebración, parrillas de barrio y helados para caminar frente al mar. Queremos que
              encontrarlos sea parte del disfrute.
            </p>
            <h2>Un espacio que crece con su comunidad</h2>
            <p>
              Cada ficha se revisa antes de publicarse y se mantiene al día. Quienes visitan el directorio pueden
              explorar por localidad, comparar opciones y guardar sus lugares favoritos.
            </p>
          </>
        ) : (
          <div className="pasos">
            {PASOS.map(([numero, titulo, texto]) => (
              <div key={numero}>
                <span>{numero}</span>
                <h2>{titulo}</h2>
                <p>{texto}</p>
              </div>
            ))}
          </div>
        )}
        <div className="aviso-demo">
          <CircleHelp size={20} />
          <p>
            La guía muestra solo fichas revisadas y publicadas. Los datos que faltan quedan sin informar: no se
            inventan fotos, precios, valoraciones ni servicios.
          </p>
        </div>
        <Link to="/explorar" className="boton boton-naranja">
          Empezá a descubrir <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )
}

export default Informacion
