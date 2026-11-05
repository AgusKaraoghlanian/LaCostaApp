import { Accessibility, CalendarDays, Leaf, PawPrint, Sun, Utensils } from 'lucide-react'

// El ícono de cada prestación conocida; las demás llevan cubiertos.
const ICONOS = {
  'Acepta mascotas': PawPrint,
  'Opciones vegetarianas': Leaf,
  Accesible: Accessibility,
  'Mesas al aire libre': Sun,
  Reservas: CalendarDays,
}

const Prestaciones = ({ prestaciones }) => (
  <section className="detalle-seccion">
    <h2>Para disfrutar a tu manera</h2>
    <div className="servicios">
      {prestaciones.map((p) => {
        const Icono = ICONOS[p] ?? Utensils
        return (
          <span key={p}>
            <Icono size={20} strokeWidth={1.5} />
            {p}
          </span>
        )
      })}
    </div>
  </section>
)

export default Prestaciones
