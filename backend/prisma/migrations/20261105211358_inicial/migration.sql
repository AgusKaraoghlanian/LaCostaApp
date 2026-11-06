-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoComercial" AS ENUM ('SIN_CONFIRMAR', 'ACTIVO', 'TEMPORALMENTE_CERRADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "Canal" AS ENUM ('SALON', 'DELIVERY', 'RETIRO', 'SIN_ESPECIFICAR');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('PROPUESTO', 'APROBADO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ADMINISTRADOR',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "partidoId" INTEGER NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#e5eadc',
    "icono" TEXT NOT NULL DEFAULT 'utensils',

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negocio" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreClave" TEXT NOT NULL,
    "localidadId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "estadoComercial" "EstadoComercial" NOT NULL DEFAULT 'SIN_CONFIRMAR',
    "descripcion" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',
    "zonaAtencion" TEXT NOT NULL DEFAULT '',
    "telefono" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "web" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "horariosTexto" TEXT NOT NULL DEFAULT '',
    "prestaciones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "precio" INTEGER,
    "foto" TEXT,
    "referenciaVerificacion" TEXT NOT NULL,
    "revisionBorrador" INTEGER NOT NULL DEFAULT 1,
    "revisionPublicadaId" INTEGER,
    "creadoPorId" INTEGER NOT NULL,
    "editadoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "dia" INTEGER NOT NULL,
    "abre" TEXT NOT NULL,
    "cierra" TEXT NOT NULL,
    "alDiaSiguiente" BOOLEAN NOT NULL DEFAULT false,
    "vigenteDesde" TEXT,
    "vigenteHasta" TEXT,
    "temporada" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioEspecial" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "abre" TEXT,
    "cierra" TEXT,

    CONSTRAINT "HorarioEspecial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoCarta" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "carta" TEXT NOT NULL DEFAULT 'Carta',
    "seccion" TEXT NOT NULL DEFAULT 'Carta',
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "variante" TEXT NOT NULL DEFAULT 'Base',
    "precioCentavos" INTEGER,
    "moneda" TEXT,
    "precioTexto" TEXT NOT NULL DEFAULT '',
    "canal" "Canal" NOT NULL DEFAULT 'SIN_ESPECIFICAR',
    "estado" "EstadoProducto" NOT NULL DEFAULT 'PROPUESTO',

    CONSTRAINT "ProductoCarta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionNegocio" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "datos" JSONB NOT NULL,
    "nombre" TEXT NOT NULL,
    "busqueda" TEXT NOT NULL,
    "precio" INTEGER,
    "prestaciones" TEXT[],
    "categoriaId" INTEGER NOT NULL,
    "localidadId" INTEGER NOT NULL,
    "aprobadaPorId" INTEGER NOT NULL,
    "aprobadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Provincia_nombre_key" ON "Provincia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Partido_provinciaId_nombre_key" ON "Partido"("provinciaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_partidoId_nombre_key" ON "Localidad"("partidoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_clave_key" ON "Categoria"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Negocio_slug_key" ON "Negocio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Negocio_revisionPublicadaId_key" ON "Negocio"("revisionPublicadaId");

-- CreateIndex
CREATE INDEX "Negocio_localidadId_idx" ON "Negocio"("localidadId");

-- CreateIndex
CREATE INDEX "Negocio_categoriaId_idx" ON "Negocio"("categoriaId");

-- CreateIndex
CREATE INDEX "Negocio_nombreClave_idx" ON "Negocio"("nombreClave");

-- CreateIndex
CREATE INDEX "Horario_negocioId_idx" ON "Horario"("negocioId");

-- CreateIndex
CREATE INDEX "HorarioEspecial_negocioId_idx" ON "HorarioEspecial"("negocioId");

-- CreateIndex
CREATE INDEX "ProductoCarta_negocioId_orden_idx" ON "ProductoCarta"("negocioId", "orden");

-- CreateIndex
CREATE INDEX "RevisionNegocio_categoriaId_idx" ON "RevisionNegocio"("categoriaId");

-- CreateIndex
CREATE INDEX "RevisionNegocio_localidadId_idx" ON "RevisionNegocio"("localidadId");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionNegocio_negocioId_numero_key" ON "RevisionNegocio"("negocioId", "numero");

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "Provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Localidad" ADD CONSTRAINT "Localidad_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negocio" ADD CONSTRAINT "Negocio_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "Localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negocio" ADD CONSTRAINT "Negocio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negocio" ADD CONSTRAINT "Negocio_revisionPublicadaId_fkey" FOREIGN KEY ("revisionPublicadaId") REFERENCES "RevisionNegocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negocio" ADD CONSTRAINT "Negocio_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negocio" ADD CONSTRAINT "Negocio_editadoPorId_fkey" FOREIGN KEY ("editadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioEspecial" ADD CONSTRAINT "HorarioEspecial_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoCarta" ADD CONSTRAINT "ProductoCarta_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionNegocio" ADD CONSTRAINT "RevisionNegocio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionNegocio" ADD CONSTRAINT "RevisionNegocio_aprobadaPorId_fkey" FOREIGN KEY ("aprobadaPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
