-- Costa a la carta · Instalación para un proyecto NUEVO y dedicado.
-- Archivo preparado únicamente: no se ejecutó contra ningún proyecto.
-- No aplicar en la base «la-costa-en-datos».
begin;

create table public.categories (
 id text primary key,
 nombre text not null unique check (length(nombre) between 3 and 60),
 texto text not null default 'Una nueva propuesta para descubrir',
 color text not null default '#e6e9da',
 icono text not null default 'utensils'
);
create table public.locations (
 id text primary key,
 nombre text not null unique,
 provincia text not null default 'Buenos Aires',
 partido text not null default 'La Costa'
);
create table public.owners (
 id uuid primary key references auth.users(id) on delete cascade,
 nombre text not null default '',
 creado_en timestamptz not null default now()
);
create table public.listings (
 id text primary key default gen_random_uuid()::text,
 owner_id uuid references public.owners(id) on delete set null,
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 nombre text not null check (length(nombre) between 2 and 100),
 categoria text not null references public.categories(id),
 localidad text not null references public.locations(nombre),
 direccion text not null check (length(direccion) <= 180),
 descripcion text not null check (length(descripcion) between 20 and 1200),
 precio smallint not null default 2 check (precio between 1 and 3),
 prestaciones text[] not null default '{}',
 contacto_email text not null default '',
 telefono text not null default '',
 web text not null default '' check (web = '' or web ~ '^https?://'),
 horarios text not null default '',
 imagen text not null default '',
 galeria text[] not null default '{}',
 destacado boolean not null default false,
 valoracion numeric(2,1) not null default 0 check (valoracion between 0 and 5),
 opiniones integer not null default 0 check (opiniones >= 0),
 estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
 demostracion boolean not null default false,
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 negocio_id text not null references public.listings(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null,
 nombre text not null check (length(nombre) between 2 and 100),
 puntuacion smallint not null check (puntuacion between 1 and 5),
 texto text not null check (length(texto) between 20 and 1500),
 fecha date not null default current_date,
 estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado'))
);
create table public.leads (
 id uuid primary key default gen_random_uuid(),
 negocio_id text not null references public.listings(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 nombre text not null check (length(nombre) between 2 and 100),
 email text not null check (length(email) <= 320),
 mensaje text not null check (length(mensaje) between 10 and 2000),
 fecha date not null default current_date,
 estado text not null default 'nueva' check (estado in ('nueva','leida','respondida'))
);
create table public.listing_claims (
 id uuid primary key default gen_random_uuid(),
 negocio_id text not null references public.listings(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 nombre text not null check (length(nombre) between 2 and 100),
 email text not null check (length(email) <= 320),
 relacion text not null,
 verificacion text not null check (length(verificacion) between 20 and 1000),
 fecha date not null default current_date,
 estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado'))
);
create unique index reclamo_pendiente_unico on public.listing_claims (negocio_id,user_id) where estado='pendiente';
create table public.listing_images (
 id uuid primary key default gen_random_uuid(),
 negocio_id text not null references public.listings(id) on delete cascade,
 url text not null check (url ~ '^https://'),
 texto_alternativo text not null default '',
 orden integer not null default 0,
 creado_en timestamptz not null default now()
);

create index fichas_categoria_localidad on public.listings (categoria,localidad) where estado='aprobado';
create index fichas_propietario on public.listings (owner_id);
create index fichas_localidad on public.listings (localidad);
create index fichas_destacadas on public.listings (destacado,valoracion desc) where estado='aprobado';
create index resenas_negocio on public.reviews (negocio_id,estado);
create index resenas_usuario on public.reviews (user_id);
create index consultas_negocio on public.leads (negocio_id,fecha desc);
create index consultas_usuario on public.leads (user_id);
create index reclamos_usuario on public.listing_claims (user_id);
create index imagenes_negocio on public.listing_images (negocio_id,orden);

alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.owners enable row level security;
alter table public.listings enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.listing_claims enable row level security;
alter table public.listing_images enable row level security;

-- El rol se asigna únicamente desde un entorno de confianza en app_metadata.
-- Nunca se utiliza user_metadata para autorizar.
create policy "Categorías públicas" on public.categories for select to anon,authenticated using (true);
create policy "Administrar categorías" on public.categories for all to authenticated
 using ((select auth.jwt()->'app_metadata'->>'role')='admin')
 with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Localidades públicas" on public.locations for select to anon,authenticated using (true);
create policy "Administrar localidades" on public.locations for all to authenticated
 using ((select auth.jwt()->'app_metadata'->>'role')='admin')
 with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Leer perfil propio" on public.owners for select to authenticated
 using ((select auth.uid())=id or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Crear perfil propio" on public.owners for insert to authenticated with check ((select auth.uid())=id);
create policy "Editar perfil propio" on public.owners for update to authenticated
 using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "Leer fichas aprobadas o propias" on public.listings for select to anon,authenticated
 using (estado='aprobado' or (select auth.uid())=owner_id or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Enviar ficha propia" on public.listings for insert to authenticated
 with check (((select auth.uid())=owner_id and estado='pendiente' and destacado=false) or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Editar ficha propia o administrar" on public.listings for update to authenticated
 using ((select auth.uid())=owner_id or (select auth.jwt()->'app_metadata'->>'role')='admin')
 with check (((select auth.uid())=owner_id and estado='pendiente') or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Leer reseñas publicadas o propias" on public.reviews for select to anon,authenticated
 using ((estado='aprobado' and exists(select 1 from public.listings l where l.id=negocio_id and l.estado='aprobado')) or (select auth.uid())=user_id or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Enviar reseña propia" on public.reviews for insert to authenticated
 with check ((select auth.uid())=user_id and estado='pendiente' and exists(select 1 from public.listings l where l.id=negocio_id and l.estado='aprobado'));
create policy "Moderar reseñas" on public.reviews for update to authenticated
 using ((select auth.jwt()->'app_metadata'->>'role')='admin')
 with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Enviar consulta propia" on public.leads for insert to authenticated
 with check ((select auth.uid())=user_id and estado='nueva' and exists(select 1 from public.listings l where l.id=negocio_id and l.estado='aprobado'));
create policy "Leer consultas autorizadas" on public.leads for select to authenticated
 using ((select auth.uid())=user_id or exists(select 1 from public.listings l where l.id=negocio_id and l.owner_id=(select auth.uid())) or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Actualizar consultas del negocio" on public.leads for update to authenticated
 using (exists(select 1 from public.listings l where l.id=negocio_id and l.owner_id=(select auth.uid())) or (select auth.jwt()->'app_metadata'->>'role')='admin')
 with check (exists(select 1 from public.listings l where l.id=negocio_id and l.owner_id=(select auth.uid())) or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Enviar solicitud propia" on public.listing_claims for insert to authenticated
 with check ((select auth.uid())=user_id and estado='pendiente' and exists(select 1 from public.listings l where l.id=negocio_id and l.estado='aprobado'));
create policy "Leer solicitudes propias o administrar" on public.listing_claims for select to authenticated
 using ((select auth.uid())=user_id or (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Revisar solicitudes" on public.listing_claims for update to authenticated
 using ((select auth.jwt()->'app_metadata'->>'role')='admin')
 with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Ver imágenes de fichas accesibles" on public.listing_images for select to anon,authenticated
 using (exists(select 1 from public.listings l where l.id=negocio_id));
create policy "Gestionar imágenes propias" on public.listing_images for all to authenticated
 using (exists(select 1 from public.listings l where l.id=negocio_id and (l.owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='admin')))
 with check (exists(select 1 from public.listings l where l.id=negocio_id and (l.owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='admin')));

-- Evita que una cuenta propietaria se destaque o modifique su reputación.
create function public.validar_edicion_ficha() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'admin' then
  if tg_op='INSERT' then
   new.destacado:=false; new.valoracion:=0; new.opiniones:=0; new.demostracion:=false;
  elsif new.owner_id is distinct from old.owner_id or new.destacado is distinct from old.destacado
   or new.valoracion is distinct from old.valoracion or new.opiniones is distinct from old.opiniones
   or new.demostracion is distinct from old.demostracion then
   raise exception 'Solo administración puede modificar la titularidad, los destacados y la reputación';
  end if;
  new.estado:='pendiente';
 end if;
 new.actualizado_en:=now();
 return new;
end;
$$;
revoke all on function public.validar_edicion_ficha() from public,anon,authenticated;
create trigger proteger_edicion_ficha before insert or update on public.listings
 for each row execute function public.validar_edicion_ficha();

-- La aprobación de titularidad y el cambio de propietario son una transacción.
-- Se conserva SECURITY INVOKER: las políticas siguen aplicándose.
create function public.aprobar_reclamo(reclamo_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare solicitud public.listing_claims;
begin
 if auth.uid() is null or coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'admin' then
  raise exception 'Se requiere una cuenta de administración';
 end if;
 select * into strict solicitud from public.listing_claims where id=reclamo_id and estado='pendiente' for update;
 -- El solicitante necesita haber creado su perfil al iniciar el reclamo.
 update public.listings set owner_id=solicitud.user_id where id=solicitud.negocio_id;
 update public.listing_claims set estado='aprobado' where id=reclamo_id;
end;
$$;
revoke all on function public.aprobar_reclamo(uuid) from public,anon;
grant execute on function public.aprobar_reclamo(uuid) to authenticated;

grant select on public.categories,public.locations,public.listings,public.reviews,public.listing_images to anon;
grant select,insert,update,delete on public.categories,public.locations,public.listing_images to authenticated;
grant select,insert,update on public.owners,public.listings,public.reviews,public.leads,public.listing_claims to authenticated;
commit;

-- Verificación cuando se conecte el proyecto dedicado:
-- select tablename,rowsecurity from pg_tables where schemaname='public';
-- Probar con dos cuentas: una no debe poder editar fichas ni leer consultas de la otra.
