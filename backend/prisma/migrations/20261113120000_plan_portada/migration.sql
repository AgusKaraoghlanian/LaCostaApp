-- CreateEnum
CREATE TYPE "PlanPortada" AS ENUM ('NINGUNO', 'CARRUSEL', 'LISTA', 'SABORES');

-- AlterTable
ALTER TABLE "Negocio" ADD COLUMN     "plan" "PlanPortada" NOT NULL DEFAULT 'NINGUNO';

-- AlterTable
ALTER TABLE "RevisionNegocio" ADD COLUMN     "plan" "PlanPortada" NOT NULL DEFAULT 'NINGUNO';

-- Los que ya eran destacados aparecían en "Para poner en tu lista": pasan a ese plan.
UPDATE "Negocio" SET "plan" = 'LISTA' WHERE "destacado" = true;
UPDATE "RevisionNegocio" SET "plan" = 'LISTA' WHERE "destacado" = true;
