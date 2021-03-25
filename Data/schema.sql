CREATE SCHEMA IF NOT EXISTS geo;

CREATE SCHEMA IF NOT EXISTS layers;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- TABLES

CREATE TABLE IF NOT EXISTS geo.features (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL	
)
PARTITION BY LIST (layer_id);

CREATE TABLE IF NOT EXISTS geo.maps (
    map_id uuid,
    map_name text
);

CREATE TABLE IF NOT EXISTS geo.layers (
    layer_id uuid,
    layer_name text,
    visible boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS geo.map_layer (
    map_id uuid NOT NULL,
    layer_id uuid NOT NULL	
);

CREATE TABLE IF NOT EXISTS geo.tiles (
    layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL
);

CREATE TABLE IF NOT EXISTS geo.tiles_count (
    layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,
    n integer NOT NULL
);

-- CONSTRAINTS

ALTER TABLE geo.features DROP CONSTRAINT IF EXISTS "PK_features";
ALTER TABLE geo.features ADD CONSTRAINT "PK_features" PRIMARY KEY (layer_id, feature_id);

ALTER TABLE geo.maps DROP CONSTRAINT IF EXISTS "PK_maps";
ALTER TABLE geo.maps ADD CONSTRAINT "PK_maps" PRIMARY KEY (map_id);

ALTER TABLE geo.layers DROP CONSTRAINT IF EXISTS "PK_layers";
ALTER TABLE geo.layers ADD CONSTRAINT "PK_layers" PRIMARY KEY (layer_id);

ALTER TABLE geo.map_layer DROP CONSTRAINT IF EXISTS "PK_map_layer";
ALTER TABLE geo.map_layer ADD CONSTRAINT "PK_map_layer" PRIMARY KEY (map_id, layer_id);

ALTER TABLE geo.tiles DROP CONSTRAINT IF EXISTS "PK_tiles";
ALTER TABLE geo.tiles ADD CONSTRAINT "PK_tiles" PRIMARY KEY (layer_id, x, y, z);

ALTER TABLE geo.tiles_count DROP CONSTRAINT IF EXISTS "PK_tiles_count";
ALTER TABLE geo.tiles_count ADD CONSTRAINT "PK_tiles_count" PRIMARY KEY (layer_id, x, y, z);

ALTER TABLE geo.features DROP CONSTRAINT IF EXISTS "FK_features_layer";
ALTER TABLE geo.features ADD CONSTRAINT "FK_features_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);

ALTER TABLE ONLY geo.map_layer DROP CONSTRAINT IF EXISTS "FK_map_layer_layer";	
ALTER TABLE ONLY geo.map_layer ADD CONSTRAINT "FK_map_layer_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id) ON DELETE CASCADE;
	
ALTER TABLE ONLY geo.map_layer DROP CONSTRAINT IF EXISTS "FK_map_layer_map";
ALTER TABLE ONLY geo.map_layer ADD CONSTRAINT "FK_map_layer_map" FOREIGN KEY (map_id) REFERENCES geo.maps(map_id) ON DELETE CASCADE;
	
ALTER TABLE ONLY geo.tiles_count DROP CONSTRAINT IF EXISTS "FK_tiles_count_layer";
ALTER TABLE ONLY geo.tiles_count ADD CONSTRAINT "FK_tiles_count_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);
	
ALTER TABLE ONLY geo.tiles DROP CONSTRAINT IF EXISTS "FK_tiles_layer";
ALTER TABLE ONLY geo.tiles ADD CONSTRAINT "FK_tiles_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);

-- INDICES

CREATE INDEX IF NOT EXISTS "IX_features_layer" ON ONLY geo.features USING btree (layer_id);
CREATE INDEX IF NOT EXISTS "IX_map_layer" ON geo.map_layer USING btree (map_id, layer_id);
CREATE INDEX IF NOT EXISTS "IX_features_geometry" ON ONLY geo.features USING gist (feature_geometry);
CREATE INDEX IF NOT EXISTS "IX_tiles_layer" ON ONLY geo.tiles USING btree(layer_id);
CREATE INDEX IF NOT EXISTS "IX_tiles_count_layer" ON ONLY geo.tiles_count USING btree(layer_id);

-- FUNCTIONS

CREATE OR REPLACE FUNCTION geo.get_box_tiles(layers uuid[], xmin double precision, ymin double precision, xmax double precision, ymax double precision) RETURNS SETOF geo.tiles
    LANGUAGE plpgsql STABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE	
	w float := 40075016.685578496;
	h float := w / 2;
	b box2d := ST_SetSRID(ST_MakeBox2D(ST_Point(xmin, ymin),ST_Point(xmax, ymax)), 3857);
BEGIN	
	RETURN QUERY
	SELECT *
	FROM geo.tiles
	WHERE layer_id IN (SELECT * FROM UNNEST(layers)) AND
    ST_Intersects(ST_MakeBox2D(ST_Point(geo.tile_x(x, z), geo.tile_y(y, z)), ST_Point(geo.tile_x(x + 1, z), geo.tile_y(y + 1, z))), b);
END;
$$;

CREATE OR REPLACE FUNCTION geo.get_mvt(layerid uuid, z integer, x integer, y integer) RETURNS bytea
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
WITH mvtgeom AS
	(
		SELECT ST_AsMVTGeom(feature_geometry, ST_TileEnvelope(z, x, y), extent => 4096, buffer => 64) AS geom, layerid, 4096, 'geom'
		FROM geo.features
		WHERE layer_id = layerid AND
		feature_geometry && ST_TileEnvelope(z, x, y, margin => (64.0 / 4096))
	)
	SELECT ST_AsMVT(mvtgeom.*)
	FROM mvtgeom;
$$;

CREATE OR REPLACE FUNCTION geo.get_optimized_tiles(layerid uuid, vx integer, vy integer, vz integer, zmax integer, threshold integer) RETURNS geo.tiles[]
    LANGUAGE plpgsql STABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	tt geo.tiles[];
	tiles geo.tiles[] := ARRAY[]::geo.tiles[];
	vt RECORD;
BEGIN	
	IF vz <= zmax THEN		
		tt := ARRAY(SELECT (layer_id,x,y,z) FROM geo.tiles_count WHERE layer_id = layerid AND (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n <= threshold);
		IF array_length(tt, 1) > 0 THEN
			tiles := array_cat(tiles, tt);		
		END IF;
		
		FOR vt IN
			SELECT x,y FROM geo.tiles_count WHERE layer_id = layerid AND (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n > threshold
		LOOP			
			tt := geo.get_optimized_tiles(layerid, vt.x * 2, vt.y * 2, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := geo.get_optimized_tiles(layerid, vt.x * 2 + 1,vt.y * 2, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := geo.get_optimized_tiles(layerid, vt.x * 2,vt.y * 2 + 1, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := geo.get_optimized_tiles(layerid, vt.x * 2 + 1,vt.y * 2 + 1, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;			
		END LOOP;	
	END IF;
	
	RETURN tiles;
END;
$$;

CREATE OR REPLACE FUNCTION geo.get_tiles(g public.geometry, zmin integer, zmax integer) RETURNS geo.tiles[]
    LANGUAGE plpgsql IMMUTABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	b box2d := Box2D(g);
	xmin float := ST_XMin(b);
	xmax float := ST_XMax(b);
	ymin float := ST_YMin(b);
	ymax float := ST_YMax(b);
	w float := 40075016.685578496;
	h float := w / 2;	
	n int := 1 << zmax;
	tiles geo.tiles[] := ARRAY[]::geo.tiles[];	
	x0 int := floor((xmin + h) * n / w);
	y0 int := floor((h - ymin) * n / w);	
	x1 int := floor((xmax + h) * n / w);
	y1 int := floor((h - ymax) * n / w);
	x int;
	y int;
	z int;
BEGIN									
	FOR z IN REVERSE zmax..zmin LOOP				
		FOR x IN x0..x1 LOOP
			FOR y IN y0..y1 LOOP				
				tiles := array_append(tiles, (NULL, x, y, z)::geo.tiles);
			END LOOP;
		END LOOP;
		x0 := x0 >> 1;
		y0 := y0 >> 1;
		x1 := x1 >> 1;
		y1 := y1 >> 1;
	END LOOP;
	RETURN tiles;
END;
$$;

CREATE OR REPLACE FUNCTION geo.tile_x(x integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN w * x / (1 << z) - h;
END;
$$;

CREATE OR REPLACE FUNCTION geo.tile_y(y integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN h - w * y / (1 << z);
END;
$$;

CREATE OR REPLACE FUNCTION geo.update_layer() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
		IF (TG_OP = 'INSERT') THEN
        	EXECUTE format('CREATE TABLE layers.%I (feature_id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY, feature_geometry geometry)', NEW.layer_id);
			EXECUTE format('CREATE TABLE geo."features_%s" PARTITION OF geo.features FOR VALUES IN (%L)', NEW.layer_id, NEW.layer_id);
		ELSIF (TG_OP = 'DELETE') THEN
			EXECUTE format('DROP TABLE layers.%I', NEW.layer_id);
			EXECUTE format('DROP TABLE geo."features_%s"', NEW.layer_id);
		END IF;
        RETURN NEW;
    END;
$$;

CREATE OR REPLACE FUNCTION geo.update_tile_count(layerid uuid, zmax integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM geo.tiles_count A WHERE A.layer_id = layerid;
	INSERT INTO geo.tiles_count
	SELECT layerid, B.x, B.y, B.z, count(A.feature_id)
	FROM geo.features A, UNNEST(geo.get_tiles(A.feature_geometry, 0, zmax)) B
	WHERE A.layer_id = layerid
	GROUP BY B.x, B.y, B.z;	
END;
$$;

CREATE OR REPLACE FUNCTION geo.update_tiles(layerid uuid, zmax integer, threshold integer) RETURNS void
    LANGUAGE sql
    AS $$
	DELETE FROM geo.tiles WHERE layer_id = layerid;
	INSERT INTO geo.tiles
	SELECT A.* FROM UNNEST (geo.get_optimized_tiles(layerid, NULL, NULL, 0, zmax, threshold)) A;
$$;

-- TRIGGERS

DO $$
BEGIN
IF NOT EXISTS (SELECT * FROM pg_trigger WHERE tgname = 'update_layer') THEN
	CREATE TRIGGER update_layer AFTER INSERT OR DELETE ON geo.layers FOR EACH ROW EXECUTE FUNCTION geo.update_layer();
END IF;
END;
$$ LANGUAGE 'plpgsql';