CREATE SCHEMA IF NOT EXISTS geo;
CREATE SCHEMA IF NOT EXISTS layers;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS geo.layers
(
    layer_id uuid NOT NULL,
    layer_name text,
    visible boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_layers" PRIMARY KEY (layer_id)
);

CREATE TABLE IF NOT EXISTS geo.maps
(
    map_id uuid NOT NULL,
    map_name text,
    CONSTRAINT "PK_maps" PRIMARY KEY (map_id)
);

CREATE TABLE IF NOT EXISTS geo.map_layer
(
    layer_id uuid NOT NULL,
    map_id uuid NOT NULL,
    CONSTRAINT "PK_map_layer" PRIMARY KEY (layer_id, map_id),
    CONSTRAINT "FK_map_layer_layers_layer_id" FOREIGN KEY (layer_id)
        REFERENCES geo.layers (layer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "FK_map_layer_maps_map_id" FOREIGN KEY (map_id)
        REFERENCES geo.maps (map_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS geo.tiles
(   
	layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,	
    CONSTRAINT "PK_tiles" PRIMARY KEY (layer_id, x, y, z),
    CONSTRAINT "FK_tiles_layers_layer_id" FOREIGN KEY (layer_id)
        REFERENCES geo.layers (layer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS geo.tiles_count
(    
	layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,	
    n integer NOT NULL,	
    CONSTRAINT "PK_tiles_count" PRIMARY KEY (layer_id, x, y, z),
	CONSTRAINT "FK_tiles_count_layers_layer_id" FOREIGN KEY (layer_id)
        REFERENCES geo.layers (layer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION geo.tile_x(
	x integer,
	z integer)
    RETURNS double precision
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    
AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN w * x / (1 << z) - h;
END;
$$;

CREATE OR REPLACE FUNCTION geo.tile_y(
	y integer,
	z integer)
    RETURNS double precision
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    
AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN h - w * y / (1 << z);
END;
$$;

CREATE OR REPLACE FUNCTION geo.get_box_tiles(
    layers uuid[],
	xmin double precision,
	ymin double precision,
	xmax double precision,
	ymax double precision)
    RETURNS SETOF geo.tiles
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
    
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

CREATE OR REPLACE FUNCTION geo.get_optimized_tiles(
    layerid uuid,
	vx integer,
	vy integer,
	vz integer,
	zmax integer,
	threshold integer)
    RETURNS geo.tiles[]
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    
AS $$
DECLARE
	tt geo.tiles[];
	tiles geo.tiles[] := ARRAY[]::geo.tiles[];
	vt RECORD;
BEGIN	
	IF vz <= zmax THEN		
		tt := ARRAY(SELECT (layer_id,x,y,z) FROM geo.tiles_count WHERE (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n <= threshold);
		IF array_length(tt, 1) > 0 THEN
			tiles := array_cat(tiles, tt);		
		END IF;
		
		FOR vt IN
			SELECT x,y FROM geo.tiles_count WHERE (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n > threshold
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

CREATE OR REPLACE FUNCTION geo.get_tiles(    
	g geometry,
	zmin integer,
	zmax integer)
    RETURNS geo.tiles[]
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    
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

CREATE OR REPLACE FUNCTION geo.update_tile_count( 
	layerid uuid,
	zmax integer)
    RETURNS void
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE    
AS $$	
BEGIN
	DELETE FROM geo.tiles_count A WHERE A.layer_id = layerid;	
	EXECUTE format('INSERT INTO geo.tiles_count SELECT %L::uuid, B.x, B.y, B.z, count(A.feature_id) FROM layers.%I A, UNNEST(geo.get_tiles(A.feature_geometry, 0, %s)) B GROUP BY B.x, B.y, B.z;', layerid, layerid, zmax);
END;
$$;

CREATE OR REPLACE FUNCTION geo.update_layer() RETURNS trigger AS $$
    BEGIN
		IF (TG_OP = 'INSERT') THEN
        	EXECUTE format('CREATE TABLE layers.%I (feature_id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY, feature_geometry geometry)', NEW.layer_id);
		ELSIF (TG_OP = 'DELETE') THEN
			EXECUTE format('DROP TABLE layers.%I', NEW.layer_id);
		END IF;
        RETURN NEW;
    END;
$$ LANGUAGE 'plpgsql';

DO $$
BEGIN
IF NOT EXISTS (SELECT * FROM pg_trigger WHERE tgname = 'update_layer') THEN
	CREATE TRIGGER update_layer AFTER INSERT OR DELETE ON geo.layers FOR EACH ROW EXECUTE FUNCTION geo.update_layer();
END IF;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION geo.update_tiles( 
	layerid uuid,
	zmax integer,
	threshold integer)
    RETURNS void
    LANGUAGE 'sql'

    COST 100
    VOLATILE 
    
AS $$
	DELETE FROM geo.tiles WHERE layer_id = layerid;
	INSERT INTO geo.tiles
	SELECT A.* FROM UNNEST (geo.get_optimized_tiles(layerid, NULL, NULL, 0, zmax, threshold)) A;
$$;

CREATE OR REPLACE FUNCTION geo.mvt_tile(layerid uuid, zoom integer, x integer, y integer, out mvt bytea) RETURNS bytea
AS $$
BEGIN
	EXECUTE format('SELECT ST_AsMVT(q, %1$L, 4096, %2$L) FROM (SELECT feature_id, ST_AsMVTGeom(feature_geometry,TileBBox(%3$s, %4$s, %5$s),4096,256,false) geom FROM layers.%1$I WHERE feature_geometry && TileBBox(%3$s, %4$s, %5$s) AND ST_Intersects(feature_geometry, TileBBox(%3$s, %4$s, %5$s))) q', layerid, 'geom', zoom, x, y);
END;
$$ LANGUAGE 'plpgsql';