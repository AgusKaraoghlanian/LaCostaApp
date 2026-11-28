# Baja de Overture Maps (https://overturemaps.org, datos abiertos de Meta, Microsoft y Foursquare)
# los lugares gastronómicos y boliches de la Costa y los guarda en un JSON que lee
# prisma/importar-overture.js. No hace falta cuenta ni clave.
#   pip install pyarrow
#   python prisma/overture/bajar.py 2026-11-18.0      (la versión: ver https://docs.overturemaps.org/release/latest/)
import json, os, sys
import pyarrow as pa, pyarrow.compute as pc, pyarrow.fs as pfs, pyarrow.parquet as pq

VERSION = sys.argv[1] if len(sys.argv) > 1 else '2026-11-18.0'
# De San Clemente a Costa Esmeralda (la misma caja que el importador de OpenStreetMap).
X0, X1, Y0, Y1 = -56.95, -56.6, -37.08, -36.28
EXTRA = {'dance_club', 'karaoke_venue'}  # boliches: no están dentro de food_and_drink

opciones = {'anonymous': True, 'region': 'us-west-2'}
if os.environ.get('HTTPS_PROXY'):
    opciones['proxy_options'] = os.environ['HTTPS_PROXY']
fs = pfs.S3FileSystem(**opciones)
base = f'overturemaps-us-west-2/release/{VERSION}/theme=places/type=place'

tablas = []
for info in fs.get_file_info(pfs.FileSelector(base)):
    archivo = pq.ParquetFile(info.path, filesystem=fs)
    md = archivo.metadata
    columnas = {md.row_group(0).column(i).path_in_schema: i for i in range(md.num_columns)}
    grupos = []
    for g in range(md.num_row_groups):
        st = lambda n: md.row_group(g).column(columnas[n]).statistics
        if st('bbox.xmin').min <= X1 and st('bbox.xmax').max >= X0 and st('bbox.ymin').min <= Y1 and st('bbox.ymax').max >= Y0:
            grupos.append(g)
    if not grupos:
        continue
    tabla = archivo.read_row_groups(grupos)
    caja = tabla.column('bbox').combine_chunks()
    x, y = caja.field('xmin'), caja.field('ymin')
    tablas.append(tabla.filter(pc.and_(pc.and_(pc.greater_equal(x, X0), pc.less_equal(x, X1)),
                                       pc.and_(pc.greater_equal(y, Y0), pc.less_equal(y, Y1)))))
    print(info.path.split('/')[-1][:12], len(grupos), 'grupos', flush=True)

lugares = []
for f in pa.concat_tables(tablas).to_pylist():
    tax = f.get('taxonomy') or {}
    if 'food_and_drink' not in (tax.get('hierarchy') or []) and tax.get('primary') not in EXTRA:
        continue
    direccion = (f.get('addresses') or [{}])[0] or {}
    lugares.append({
        'id': f['id'],
        'nombre': (f.get('names') or {}).get('primary'),
        'categoria': tax.get('primary'),
        'confianza': round(f.get('confidence') or 0, 3),
        'lat': round(f['bbox']['ymin'], 6),
        'lon': round(f['bbox']['xmin'], 6),
        'direccion': direccion.get('freeform') or '',
        'localidad': direccion.get('locality') or '',
        'telefonos': f.get('phones') or [],
        'webs': f.get('websites') or [],
        'redes': f.get('socials') or [],
        'fuentes': sorted({s['dataset'] for s in f.get('sources') or [] if s['dataset'] != 'Overture'}),
        'estado': f.get('operating_status'),
    })
lugares.sort(key=lambda l: (-l['lat'], l['nombre'] or ''))
salida = os.path.join(os.path.dirname(__file__), f'lugares-{VERSION[:10]}.json')
with open(salida, 'w', encoding='utf-8') as archivo:
    json.dump({'version': VERSION, 'lugares': lugares}, archivo, ensure_ascii=False, indent=0)
print(len(lugares), 'lugares en', salida)
