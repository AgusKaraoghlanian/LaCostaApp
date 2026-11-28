-- CreateEnum
CREATE TYPE "TipoSolicitud" AS ENUM ('SUMAR', 'RECLAMAR');

-- CreateTable
CREATE TABLE "SolicitudNegocio" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoSolicitud" NOT NULL,
    "nombreNegocio" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "correoEnviado" BOOLEAN NOT NULL DEFAULT false,
    "atendida" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitudNegocio_creadaEn_idx" ON "SolicitudNegocio"("creadaEn");
