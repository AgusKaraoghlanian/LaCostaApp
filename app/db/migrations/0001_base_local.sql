PRAGMA foreign_keys=ON;
--> statement-breakpoint
CREATE TABLE provinces(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE);
--> statement-breakpoint
CREATE TABLE districts(id TEXT PRIMARY KEY,province_id TEXT NOT NULL REFERENCES provinces(id),name TEXT NOT NULL,UNIQUE(province_id,name));
--> statement-breakpoint
CREATE TABLE locations(id TEXT PRIMARY KEY,district_id TEXT NOT NULL REFERENCES districts(id),name TEXT NOT NULL,aliases_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(aliases_json)),UNIQUE(district_id,name));
--> statement-breakpoint
CREATE TABLE categories(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,description TEXT NOT NULL DEFAULT '');
--> statement-breakpoint
CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('admin','owner','registered')),disabled INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE auth_identities(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),provider TEXT NOT NULL,subject TEXT NOT NULL,UNIQUE(provider,subject));
--> statement-breakpoint
CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE listings(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,location_id TEXT NOT NULL REFERENCES locations(id),commercial_status TEXT NOT NULL DEFAULT 'sin_confirmar',draft_revision INTEGER NOT NULL DEFAULT 1,approved_revision_id TEXT,published_revision_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE listing_drafts(listing_id TEXT PRIMARY KEY REFERENCES listings(id),data_json TEXT NOT NULL CHECK(json_valid(data_json)),revision INTEGER NOT NULL CHECK(revision>0),updated_by TEXT NOT NULL REFERENCES users(id),updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE listing_categories(listing_id TEXT NOT NULL REFERENCES listings(id),category_id TEXT NOT NULL REFERENCES categories(id),PRIMARY KEY(listing_id,category_id));
--> statement-breakpoint
CREATE TABLE services(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE);
--> statement-breakpoint
CREATE TABLE listing_services(listing_id TEXT NOT NULL REFERENCES listings(id),service_id TEXT NOT NULL REFERENCES services(id),PRIMARY KEY(listing_id,service_id));
--> statement-breakpoint
CREATE TABLE listing_aliases(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),alias TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE slug_redirects(old_slug TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE listing_memberships(listing_id TEXT NOT NULL REFERENCES listings(id),user_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL CHECK(role IN('owner','editor')),verified_at TEXT NOT NULL,PRIMARY KEY(listing_id,user_id));
--> statement-breakpoint
CREATE TABLE listing_claims(id TEXT PRIMARY KEY,listing_id TEXT REFERENCES listings(id),user_id TEXT NOT NULL REFERENCES users(id),private_json TEXT NOT NULL CHECK(json_valid(private_json)),state TEXT NOT NULL DEFAULT 'pendiente',created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE suggestions(id TEXT PRIMARY KEY,listing_id TEXT REFERENCES listings(id),user_id TEXT NOT NULL REFERENCES users(id),private_json TEXT NOT NULL CHECK(json_valid(private_json)),state TEXT NOT NULL DEFAULT 'pendiente',created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE leads(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),user_id TEXT REFERENCES users(id),private_json TEXT NOT NULL CHECK(json_valid(private_json)),state TEXT NOT NULL DEFAULT 'nueva',created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE reviews(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),user_id TEXT NOT NULL REFERENCES users(id),rating INTEGER CHECK(rating BETWEEN 1 AND 5),text TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'pendiente',created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE sources(id TEXT PRIMARY KEY,url TEXT NOT NULL,type TEXT NOT NULL CHECK(type IN('web','social','documento','manual')),policy TEXT NOT NULL,access_reference TEXT NOT NULL,allowed_domains_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(allowed_domains_json)),state TEXT NOT NULL DEFAULT 'activa',created_by TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL,UNIQUE(url,type));
--> statement-breakpoint
CREATE TABLE listing_sources(listing_id TEXT NOT NULL REFERENCES listings(id),source_id TEXT NOT NULL REFERENCES sources(id),PRIMARY KEY(listing_id,source_id));
--> statement-breakpoint
CREATE TABLE import_jobs(id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES sources(id),listing_id TEXT REFERENCES listings(id),created_by TEXT NOT NULL REFERENCES users(id),state TEXT NOT NULL CHECK(state IN('queued','running','awaiting_review','partial','retry_scheduled','completed','failed','cancelled')),stage TEXT NOT NULL DEFAULT 'En espera',attempt INTEGER NOT NULL DEFAULT 0 CHECK(attempt BETWEEN 0 AND 3),generation INTEGER NOT NULL DEFAULT 0,lease_token_hash TEXT,lease_device TEXT,lease_expires_at TEXT,retry_after TEXT,cancelled_at TEXT,result_json TEXT CHECK(result_json IS NULL OR json_valid(result_json)),error_json TEXT CHECK(error_json IS NULL OR json_valid(error_json)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE import_runs(id TEXT PRIMARY KEY,job_id TEXT NOT NULL REFERENCES import_jobs(id),engine_version TEXT NOT NULL,attempt INTEGER NOT NULL,started_at TEXT NOT NULL,finished_at TEXT,UNIQUE(job_id,attempt));
--> statement-breakpoint
CREATE TABLE source_resources(id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES sources(id),run_id TEXT NOT NULL REFERENCES import_runs(id),original_url TEXT NOT NULL,final_url TEXT NOT NULL,mime TEXT NOT NULL,status INTEGER NOT NULL,content_hash TEXT NOT NULL,etag TEXT,last_modified TEXT,observed_at TEXT NOT NULL,byte_count INTEGER NOT NULL,UNIQUE(run_id,original_url));
--> statement-breakpoint
CREATE TABLE observations(id TEXT PRIMARY KEY,entity_type TEXT NOT NULL,entity_key TEXT NOT NULL,field_path TEXT NOT NULL,raw_json TEXT NOT NULL CHECK(json_valid(raw_json)),normalized_json TEXT NOT NULL CHECK(json_valid(normalized_json)),source_id TEXT NOT NULL REFERENCES sources(id),resource_id TEXT REFERENCES source_resources(id),run_id TEXT REFERENCES import_runs(id),observed_at TEXT NOT NULL,method TEXT NOT NULL,extractor_version TEXT NOT NULL,pointer TEXT NOT NULL,evidence TEXT NOT NULL CHECK(length(evidence)<=500),uncertainty TEXT NOT NULL,reason TEXT NOT NULL,created_by TEXT REFERENCES users(id),UNIQUE(run_id,resource_id,entity_key,field_path,method,pointer));
--> statement-breakpoint
CREATE TRIGGER observations_immutable_update BEFORE UPDATE ON observations BEGIN SELECT RAISE(ABORT,'Las observaciones son inmutables'); END;
--> statement-breakpoint
CREATE TRIGGER observations_immutable_delete BEFORE DELETE ON observations BEGIN SELECT RAISE(ABORT,'Las observaciones son inmutables'); END;
--> statement-breakpoint
CREATE TABLE field_selections(listing_id TEXT NOT NULL REFERENCES listings(id),field_path TEXT NOT NULL,observation_id TEXT NOT NULL REFERENCES observations(id),revision INTEGER NOT NULL,selected_by TEXT NOT NULL REFERENCES users(id),selected_at TEXT NOT NULL,reason TEXT NOT NULL,locked INTEGER NOT NULL DEFAULT 0,lock_reason TEXT NOT NULL DEFAULT '',PRIMARY KEY(listing_id,field_path));
--> statement-breakpoint
CREATE TABLE change_sets(id TEXT PRIMARY KEY,job_id TEXT REFERENCES import_jobs(id),listing_id TEXT REFERENCES listings(id),base_revision INTEGER NOT NULL,state TEXT NOT NULL DEFAULT 'pendiente',created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE change_items(id TEXT PRIMARY KEY,change_set_id TEXT NOT NULL REFERENCES change_sets(id),field_path TEXT NOT NULL,previous_observation_id TEXT REFERENCES observations(id),new_observation_id TEXT REFERENCES observations(id),base_json TEXT,editorial_json TEXT,new_json TEXT,decision TEXT NOT NULL DEFAULT 'pendiente',conflict INTEGER NOT NULL DEFAULT 0,decided_by TEXT REFERENCES users(id),decided_at TEXT);
--> statement-breakpoint
CREATE TABLE duplicate_candidates(id TEXT PRIMARY KEY,job_id TEXT NOT NULL REFERENCES import_jobs(id),listing_id TEXT NOT NULL REFERENCES listings(id),signals_json TEXT NOT NULL CHECK(json_valid(signals_json)),decision TEXT NOT NULL DEFAULT 'pendiente',decided_by TEXT REFERENCES users(id),UNIQUE(job_id,listing_id));
--> statement-breakpoint
CREATE TABLE job_checkpoints(job_id TEXT NOT NULL REFERENCES import_jobs(id),resource_key TEXT NOT NULL,generation INTEGER NOT NULL,payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),saved_at TEXT NOT NULL,PRIMARY KEY(job_id,resource_key));
--> statement-breakpoint
CREATE TABLE devices(id TEXT PRIMARY KEY,name TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,paired_by TEXT NOT NULL REFERENCES users(id),paired_at TEXT NOT NULL,last_seen_at TEXT,revoked_at TEXT);
--> statement-breakpoint
CREATE TABLE pairing_codes(code_hash TEXT PRIMARY KEY,created_by TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,used_at TEXT);
--> statement-breakpoint
CREATE TABLE opening_periods(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),day INTEGER NOT NULL CHECK(day BETWEEN 0 AND 6),opens TEXT NOT NULL,closes TEXT NOT NULL,next_day INTEGER NOT NULL DEFAULT 0,valid_from TEXT,valid_until TEXT,season TEXT,observation_id TEXT REFERENCES observations(id));
--> statement-breakpoint
CREATE TABLE opening_exceptions(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),date TEXT NOT NULL,closed INTEGER NOT NULL DEFAULT 0,opens TEXT,closes TEXT,observation_id TEXT REFERENCES observations(id));
--> statement-breakpoint
CREATE TABLE menus(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),name TEXT NOT NULL,channel TEXT,season TEXT,created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE menu_versions(id TEXT PRIMARY KEY,menu_id TEXT NOT NULL REFERENCES menus(id),number INTEGER NOT NULL,state TEXT NOT NULL,source_id TEXT REFERENCES sources(id),valid_from TEXT,valid_until TEXT,reviewed_at TEXT NOT NULL,previous_version_id TEXT REFERENCES menu_versions(id),snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),UNIQUE(menu_id,number));
--> statement-breakpoint
CREATE TABLE menu_sections(id TEXT PRIMARY KEY,menu_id TEXT NOT NULL REFERENCES menus(id),name TEXT NOT NULL,sort_order INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE products(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),logical_key TEXT NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',UNIQUE(listing_id,logical_key));
--> statement-breakpoint
CREATE TABLE product_variants(id TEXT PRIMARY KEY,product_id TEXT NOT NULL REFERENCES products(id),name TEXT NOT NULL,quantity TEXT,unit TEXT,attributes_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(attributes_json)),UNIQUE(product_id,name));
--> statement-breakpoint
CREATE TABLE price_offers(id TEXT PRIMARY KEY,variant_id TEXT NOT NULL REFERENCES product_variants(id),amount_minor INTEGER CHECK(amount_minor IS NULL OR amount_minor>=0),currency TEXT CHECK(currency IS NULL OR length(currency)=3),raw_text TEXT NOT NULL,channel TEXT NOT NULL,conditions TEXT NOT NULL DEFAULT '',valid_from TEXT,valid_until TEXT,observation_id TEXT REFERENCES observations(id),state TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE menu_version_entries(id TEXT PRIMARY KEY,menu_version_id TEXT NOT NULL REFERENCES menu_versions(id),section_id TEXT REFERENCES menu_sections(id),product_id TEXT NOT NULL REFERENCES products(id),sort_order INTEGER NOT NULL,snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)));
--> statement-breakpoint
CREATE TABLE media_assets(id TEXT PRIMARY KEY,sha256 TEXT NOT NULL,mime TEXT NOT NULL,byte_count INTEGER NOT NULL,technical_state TEXT NOT NULL,rights_state TEXT NOT NULL DEFAULT 'desconocido',created_at TEXT NOT NULL,UNIQUE(sha256));
--> statement-breakpoint
CREATE TABLE media_variants(id TEXT PRIMARY KEY,asset_id TEXT NOT NULL REFERENCES media_assets(id),object_key TEXT NOT NULL UNIQUE,width INTEGER,height INTEGER,mime TEXT NOT NULL,byte_count INTEGER NOT NULL,sha256 TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE media_rights(id TEXT PRIMARY KEY,asset_id TEXT NOT NULL REFERENCES media_assets(id),holder TEXT,authorizer TEXT,basis TEXT,reference TEXT,attribution TEXT,scope TEXT,expires_at TEXT,state TEXT NOT NULL,reviewed_by TEXT NOT NULL REFERENCES users(id),reviewed_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE listing_media(listing_id TEXT NOT NULL REFERENCES listings(id),asset_id TEXT NOT NULL REFERENCES media_assets(id),kind TEXT NOT NULL,alt TEXT NOT NULL,sort_order INTEGER NOT NULL,PRIMARY KEY(listing_id,asset_id));
--> statement-breakpoint
CREATE TABLE listing_revisions(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),number INTEGER NOT NULL,data_json TEXT NOT NULL CHECK(json_valid(data_json)),menu_json TEXT NOT NULL CHECK(json_valid(menu_json)),approved_by TEXT NOT NULL REFERENCES users(id),approved_at TEXT NOT NULL,previous_revision_id TEXT REFERENCES listing_revisions(id),UNIQUE(listing_id,number));
--> statement-breakpoint
CREATE TRIGGER revisions_immutable BEFORE UPDATE ON listing_revisions BEGIN SELECT RAISE(ABORT,'Las revisiones son inmutables'); END;
--> statement-breakpoint
CREATE TABLE publication_jobs(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL REFERENCES listings(id),revision_id TEXT NOT NULL REFERENCES listing_revisions(id),expected_published_id TEXT,state TEXT NOT NULL CHECK(state IN('queued','running','completed','failed','cancelled')),generation INTEGER NOT NULL DEFAULT 0,lease_token_hash TEXT,lease_device TEXT,lease_expires_at TEXT,error_json TEXT,created_by TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(listing_id,revision_id));
--> statement-breakpoint
CREATE TABLE publication_artifacts(revision_id TEXT PRIMARY KEY REFERENCES listing_revisions(id),listing_id TEXT NOT NULL REFERENCES listings(id),snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),html TEXT NOT NULL,sha256 TEXT NOT NULL,template_version TEXT NOT NULL,created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE audit_events(id TEXT PRIMARY KEY,actor_id TEXT,action TEXT NOT NULL,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,details_json TEXT NOT NULL CHECK(json_valid(details_json)),created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE backup_manifests(id TEXT PRIMARY KEY,state TEXT NOT NULL,manifest_json TEXT NOT NULL CHECK(json_valid(manifest_json)),created_at TEXT NOT NULL,verified_at TEXT);
--> statement-breakpoint
CREATE TABLE idempotency_keys(scope TEXT NOT NULL,actor_id TEXT NOT NULL,key TEXT NOT NULL,request_hash TEXT NOT NULL,result_json TEXT NOT NULL CHECK(json_valid(result_json)),created_at TEXT NOT NULL,PRIMARY KEY(scope,actor_id,key));
--> statement-breakpoint
CREATE TABLE transaction_checks(token TEXT PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1));
--> statement-breakpoint
CREATE INDEX jobs_pending ON import_jobs(state,retry_after,created_at);
--> statement-breakpoint
CREATE INDEX jobs_listing ON import_jobs(listing_id,updated_at);
--> statement-breakpoint
CREATE INDEX observations_source_field ON observations(source_id,entity_key,field_path,observed_at);
--> statement-breakpoint
CREATE INDEX observations_run ON observations(run_id,resource_id);
--> statement-breakpoint
CREATE INDEX publications_pending ON publication_jobs(state,created_at);
--> statement-breakpoint
CREATE INDEX sessions_expiry ON sessions(expires_at);
--> statement-breakpoint
CREATE INDEX listing_sources_source ON listing_sources(source_id);
--> statement-breakpoint
INSERT INTO provinces VALUES('buenos-aires','Buenos Aires');
--> statement-breakpoint
INSERT INTO districts VALUES('la-costa','buenos-aires','La Costa');
--> statement-breakpoint
INSERT INTO locations(id,district_id,name) VALUES('san-clemente','la-costa','San Clemente del Tuyú'),('las-toninas','la-costa','Las Toninas'),('santa-teresita','la-costa','Santa Teresita'),('mar-del-tuyu','la-costa','Mar del Tuyú'),('costa-del-este','la-costa','Costa del Este'),('aguas-verdes','la-costa','Aguas Verdes'),('la-lucila','la-costa','La Lucila del Mar'),('san-bernardo','la-costa','San Bernardo'),('mar-de-ajo','la-costa','Mar de Ajó'),('nueva-atlantis','la-costa','Nueva Atlantis');
--> statement-breakpoint
INSERT INTO categories(id,name) VALUES('restaurantes','Restaurantes'),('cafeterias','Cafeterías'),('parrillas','Parrillas'),('pizzerias','Pizzerías'),('bares','Bares y cervecerías'),('heladerias','Heladerías'),('panaderias','Panaderías'),('mariscos','Pescados y mariscos');
--> statement-breakpoint
INSERT INTO users VALUES('local-admin','Administración local','admin',0,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
