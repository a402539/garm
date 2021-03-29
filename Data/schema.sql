--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

-- Started on 2021-03-26 17:24:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 11 (class 2615 OID 31914)
-- Name: geo; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA geo;


ALTER SCHEMA geo OWNER TO postgres;

--
-- TOC entry 8 (class 2615 OID 31952)
-- Name: layers; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA layers;


ALTER SCHEMA layers OWNER TO postgres;

--
-- TOC entry 4 (class 3079 OID 161949)
-- Name: pldbgapi; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pldbgapi WITH SCHEMA public;


--
-- TOC entry 4084 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pldbgapi; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pldbgapi IS 'server-side support for debugging PL/pgSQL functions';


--
-- TOC entry 3 (class 3079 OID 31964)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 4085 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 2 (class 3079 OID 31953)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4086 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 31931)
-- Name: tiles; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.tiles (
    layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL
);


ALTER TABLE geo.tiles OWNER TO postgres;

--
-- TOC entry 995 (class 1255 OID 162051)
-- Name: get_box_tiles(uuid[], double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.get_box_tiles(layers uuid[], xmin double precision, ymin double precision, xmax double precision, ymax double precision) RETURNS SETOF geo.tiles
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


ALTER FUNCTION geo.get_box_tiles(layers uuid[], xmin double precision, ymin double precision, xmax double precision, ymax double precision) OWNER TO postgres;

--
-- TOC entry 1001 (class 1255 OID 162075)
-- Name: get_mvt(uuid, integer, integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.get_mvt(layerid uuid, z integer, x integer, y integer) RETURNS bytea
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


ALTER FUNCTION geo.get_mvt(layerid uuid, z integer, x integer, y integer) OWNER TO postgres;

--
-- TOC entry 997 (class 1255 OID 162052)
-- Name: get_optimized_tiles(uuid, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.get_optimized_tiles(layerid uuid, vx integer, vy integer, vz integer, zmax integer, threshold integer) RETURNS geo.tiles[]
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


ALTER FUNCTION geo.get_optimized_tiles(layerid uuid, vx integer, vy integer, vz integer, zmax integer, threshold integer) OWNER TO postgres;

--
-- TOC entry 996 (class 1255 OID 162050)
-- Name: get_tiles(public.geometry, integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.get_tiles(g public.geometry, zmin integer, zmax integer) RETURNS geo.tiles[]
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


ALTER FUNCTION geo.get_tiles(g public.geometry, zmin integer, zmax integer) OWNER TO postgres;

--
-- TOC entry 998 (class 1255 OID 162054)
-- Name: tile_x(integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.tile_x(x integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN w * x / (1 << z) - h;
END;
$$;


ALTER FUNCTION geo.tile_x(x integer, z integer) OWNER TO postgres;

--
-- TOC entry 999 (class 1255 OID 162055)
-- Name: tile_y(integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.tile_y(y integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE LEAKPROOF PARALLEL SAFE
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN h - w * y / (1 << z);
END;
$$;


ALTER FUNCTION geo.tile_y(y integer, z integer) OWNER TO postgres;

--
-- TOC entry 1000 (class 1255 OID 162085)
-- Name: update_layer(); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.update_layer() RETURNS trigger
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


ALTER FUNCTION geo.update_layer() OWNER TO postgres;

--
-- TOC entry 972 (class 1255 OID 32994)
-- Name: update_tile_count(uuid, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.update_tile_count(layerid uuid, zmax integer) RETURNS void
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


ALTER FUNCTION geo.update_tile_count(layerid uuid, zmax integer) OWNER TO postgres;

--
-- TOC entry 971 (class 1255 OID 32997)
-- Name: update_tiles(uuid, integer, integer); Type: FUNCTION; Schema: geo; Owner: postgres
--

CREATE FUNCTION geo.update_tiles(layerid uuid, zmax integer, threshold integer) RETURNS void
    LANGUAGE sql
    AS $$
	DELETE FROM geo.tiles WHERE layer_id = layerid;
	INSERT INTO geo.tiles
	SELECT A.* FROM UNNEST (geo.get_optimized_tiles(layerid, NULL, NULL, 0, zmax, threshold)) A;
$$;


ALTER FUNCTION geo.update_tiles(layerid uuid, zmax integer, threshold integer) OWNER TO postgres;

--
-- TOC entry 973 (class 1255 OID 33035)
-- Name: ls_bulk(uuid, json); Type: FUNCTION; Schema: layers; Owner: postgres
--

CREATE FUNCTION layers.ls_bulk(layerid uuid, res json) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE	
	items json[];	
BEGIN
	CREATE TEMP TABLE lst8 (
		panchromatic_lines int,
		nadir_offnadir text,
		sunazimuth double precision,
		reflective_samples int,
		upperleftcornerlongitude double precision,
		cloudcover double precision,
		map_projection_l1 text,
		carturl text,
		sunelevation double precision,
		"path" int,
		bpf_name_tirs text,
		thermal_lines int,
		ground_control_points_model int,
		"row" int,
		imagequality1 int,
		reflective_lines int,
		ellipsoid text,
		geometric_rmse_model double precision,
		browseurl text,
		browseavailable text,
		dayornight text,
		cpf_name text,
		data_type_l1 text,
		thermal_samples int,
		upperrightcornerlatitude double precision,
		lowerleftcornerlatitude double precision,
		scenestarttime timestamp without time zone,
		dateupdated timestamp without time zone,
		sensor text,
		panchromatic_samples int,
		ground_control_points_version int,
		landsat_product_id text,
		acquisitiondate date,
		upperrightcornerlongitude double precision,
		processing_software_version text,
		grid_cell_size_reflective double precision,
		lowerrightcornerlongitude double precision,
		lowerrightcornerlatitude double precision,
		scenecenterlongitude double precision,
		collection_category text,
		grid_cell_size_panchromatic double precision,
		bpf_name_oli text,
		scenecenterlatitude double precision,
		cloud_cover_land double precision,
		lowerleftcornerlongitude double precision,
		geometric_rmse_model_x double precision,
		geometric_rmse_model_y double precision,
		scenestoptime timestamp without time zone,
		upperleftcornerlatitude double precision,
		utm_zone int,
		date_l1_generated date,
		grid_cell_size_thermal double precision,
		datum text,
		collection_number int,
		sceneid text,
		rlut_file_name text,
		tirs_ssm_model text,
		roll_angle double precision,
		receivingstation text,
		geom geometry
	);
	
	items := ARRAY(SELECT * FROM json_array_elements(res));	
	
	INSERT INTO lst8
	SELECT
		(R->>'panchromatic_lines')::int,
		R->>'nadir_offnadir',
		(R->>'sunazimuth')::double precision,
		(R->>'reflective_samples')::int,
		(R->>'upperleftcornerlongitude')::double precision,
		(R->>'cloudcover')::double precision,
		R->>'map_projection_l1',
		R->>'carturl',
		(R->>'sunelevation')::double precision,
		(R->>'path')::int,
		R->>'bpf_name_tirs',
		(R->>'thermal_lines')::int,
		(R->>'ground_control_points_model')::int,
		(R->>'row')::int,
		(R->>'imagequality1')::int,
		(R->>'reflective_lines')::int,
		R->>'ellipsoid',
		(R->>'geometric_rmse_model')::double precision,
		R->>'browseurl',
		R->>'browseavailable',
		R->>'dayornight',
		R->>'cpf_name',
		R->>'data_type_l1',
		(R->>'thermal_samples')::int,
		(R->>'upperrightcornerlatitude')::double precision,
		(R->>'lowerleftcornerlatitude')::double precision,
		(R->>'scenestarttime')::timestamp without time zone,
		(R->>'dateupdated')::timestamp without time zone,
		R->>'sensor',
		(R->>'panchromatic_samples')::int,
		(R->>'ground_control_points_version')::int,
		R->>'landsat_product_id',
		(R->>'acquisitiondate')::date,
		(R->>'upperrightcornerlongitude')::double precision,
		R->>'processing_software_version',
		(R->>'grid_cell_size_reflective')::double precision,
		(R->>'lowerrightcornerlongitude')::double precision,
		(R->>'lowerrightcornerlatitude')::double precision,
		(R->>'scenecenterlongitude')::double precision,
		R->>'collection_category',
		(R->>'grid_cell_size_panchromatic')::double precision,
		R->>'bpf_name_oli',
		(R->>'scenecenterlatitude')::double precision,
		(R->>'cloud_cover_land')::double precision,
		(R->>'lowerleftcornerlongitude')::double precision,
		(R->>'geometric_rmse_model_x')::double precision,
		(R->>'geometric_rmse_model_y')::double precision,
		(R->>'scenestoptime')::timestamp without time zone,
		(R->>'upperleftcornerlatitude')::double precision,
		(R->>'utm_zone')::int,
		(R->>'date_l1_generated')::date,
		(R->>'grid_cell_size_thermal')::double precision,
		R->>'datum',
		(R->>'collection_number')::int,
		R->>'sceneid',
		R->>'rlut_file_name',
		R->>'tirs_ssm_model',
		(R->>'roll_angle')::double precision,
		R->>'receivingstation',
		st_geomfromgeojson(concat('{"type": "Polygon", "coordinates":', '[[[', R->>'upperleftcornerlongitude', ',', R->>'upperleftcornerlatitude', '],[', R->>'upperrightcornerlongitude', ',', R->>'upperrightcornerlatitude', '],[', R->>'lowerrightcornerlongitude', ',', R->>'lowerrightcornerlatitude', '],[', R->>'lowerleftcornerlongitude', ',', R->>'lowerleftcornerlatitude', '],[', R->>'upperleftcornerlongitude', ',', R->>'upperleftcornerlatitude', ']]]}'))
	FROM UNNEST(items) AS R;
	
	EXECUTE format('INSERT INTO layers.%I(feature_geometry) SELECT geom FROM lst8 ON CONFLICT DO NOTHING', layerid);
			
END;
$$;


ALTER FUNCTION layers.ls_bulk(layerid uuid, res json) OWNER TO postgres;

--
-- TOC entry 952 (class 1255 OID 32999)
-- Name: bounds(public.geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.bounds(g public.geometry, srid integer DEFAULT NULL::integer) RETURNS double precision[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    if srid is not null then
        g := ST_Transform(g, srid);
    end if;

    return array[
        ST_XMin(g),
        ST_YMin(g),
        ST_XMax(g),
        ST_YMax(g)
    ];
end;
$$;


ALTER FUNCTION public.bounds(g public.geometry, srid integer) OWNER TO postgres;

--
-- TOC entry 953 (class 1255 OID 33000)
-- Name: cleanint(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanint(i text) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return cast(cast(i as float) as integer);
exception
    when invalid_text_representation then
        return null;
    when numeric_value_out_of_range then
        return null;
end;
$$;


ALTER FUNCTION public.cleanint(i text) OWNER TO postgres;

--
-- TOC entry 954 (class 1255 OID 33001)
-- Name: cleannumeric(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleannumeric(i text) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return cast(cast(i as float) as numeric);
exception
    when invalid_text_representation then
        return null;
    when numeric_value_out_of_range then
        return null;
end;
$$;


ALTER FUNCTION public.cleannumeric(i text) OWNER TO postgres;

--
-- TOC entry 955 (class 1255 OID 33002)
-- Name: labelgrid(public.geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.labelgrid(g public.geometry, grid_size numeric) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    if grid_size <= 0 then
        return 'null';
    end if;
    if GeometryType(g) <> 'POINT' then
        g := (select (ST_DumpPoints(g)).geom limit 1);
    end if;
    return ST_AsText(ST_SnapToGrid(
        g,
        grid_size/2,  -- x origin
        grid_size/2,  -- y origin
        grid_size,    -- x size
        grid_size     -- y size
    ));
end;
$$;


ALTER FUNCTION public.labelgrid(g public.geometry, grid_size numeric) OWNER TO postgres;

--
-- TOC entry 956 (class 1255 OID 33003)
-- Name: largestpart(public.geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.largestpart(g public.geometry) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    -- Non-multi geometries can just pass through
    if GeometryType(g) in ('POINT', 'LINESTRING', 'POLYGON') then
        return g;
    -- MultiPolygons and GeometryCollections that contain Polygons
    elsif not ST_IsEmpty(ST_CollectionExtract(g, 3)) then
        return (
            select geom
            from (
                select (ST_Dump(ST_CollectionExtract(g,3))).geom
            ) as dump
            order by ST_Area(geom) desc
            limit 1
        );
    -- MultiLinestrings and GeometryCollections that contain Linestrings
    elsif not ST_IsEmpty(ST_CollectionExtract(g, 2)) then
        return (
            select geom
            from (
                select (ST_Dump(ST_CollectionExtract(g,2))).geom
            ) as dump
            order by ST_Length(geom) desc
            limit 1
        );
    -- Other geometry types are not really handled but we at least try to
    -- not return a MultiGeometry.
    else
        return ST_GeometryN(g, 1);
    end if;
end;
$$;


ALTER FUNCTION public.largestpart(g public.geometry) OWNER TO postgres;

--
-- TOC entry 957 (class 1255 OID 33004)
-- Name: linelabel(numeric, text, public.geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.linelabel(zoom numeric, label text, g public.geometry) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    if zoom > 20 or ST_Length(g) = 0 then
        -- if length is 0 geom is (probably) a point; keep it
        return true;
    else
        return length(label) between 1 and ST_Length(g)/(2^(20-zoom));
    end if;
end;
$$;


ALTER FUNCTION public.linelabel(zoom numeric, label text, g public.geometry) OWNER TO postgres;

--
-- TOC entry 958 (class 1255 OID 33005)
-- Name: makearc(public.geometry, public.geometry, public.geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.makearc(p0 public.geometry, p1 public.geometry, p2 public.geometry, srid integer DEFAULT NULL::integer) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_CurveToLine(ST_GeomFromText(
        'CIRCULARSTRING('
            || ST_X(p0) || ' ' || ST_Y(p0) || ', '
            || ST_X(p1) || ' ' || ST_Y(p1) || ',  '
            || ST_X(p2) || ' ' || ST_Y(p2) || ')',
        coalesce(srid, ST_SRID(p0))
    ));
end;
$$;


ALTER FUNCTION public.makearc(p0 public.geometry, p1 public.geometry, p2 public.geometry, srid integer) OWNER TO postgres;

--
-- TOC entry 959 (class 1255 OID 33006)
-- Name: mercbuffer(public.geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mercbuffer(g public.geometry, distance numeric) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_Buffer(
        g,
        distance / cos(radians(ST_Y(ST_Transform(ST_Centroid(g),4326))))
    );
end;
$$;


ALTER FUNCTION public.mercbuffer(g public.geometry, distance numeric) OWNER TO postgres;

--
-- TOC entry 960 (class 1255 OID 33007)
-- Name: mercdwithin(public.geometry, public.geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mercdwithin(g1 public.geometry, g2 public.geometry, distance numeric) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_Dwithin(
        g1,
        g2,
        distance / cos(radians(ST_Y(ST_Transform(ST_Centroid(g1),4326))))
    );
end;
$$;


ALTER FUNCTION public.mercdwithin(g1 public.geometry, g2 public.geometry, distance numeric) OWNER TO postgres;

--
-- TOC entry 961 (class 1255 OID 33008)
-- Name: merclength(public.geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.merclength(g public.geometry) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_Length(g) * cos(radians(ST_Y(ST_Transform(ST_Centroid(g),4326))));
end;
$$;


ALTER FUNCTION public.merclength(g public.geometry) OWNER TO postgres;

--
-- TOC entry 962 (class 1255 OID 33009)
-- Name: orientedenvelope(public.geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.orientedenvelope(g public.geometry) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
    p record;
    p0 geometry(point);
    p1 geometry(point);
    ctr geometry(point);
    angle_min float;
    angle_cur float;
    area_min float;
    area_cur float;
begin
    -- Approach is based on the rotating calipers method:
    -- <https://en.wikipedia.org/wiki/Rotating_calipers>
    g := ST_ConvexHull(g);
    ctr := ST_Centroid(g);
    for p in (select (ST_DumpPoints(g)).geom) loop
        p0 := p1;
        p1 := p.geom;
        if p0 is null then
            continue;
        end if;
        angle_cur := ST_Azimuth(p0, p1) - pi()/2;
        area_cur := ST_Area(ST_Envelope(ST_Rotate(g, angle_cur, ctr)));
        if area_cur < area_min or area_min is null then
            area_min := area_cur;
            angle_min := angle_cur;
        end if;
    end loop;
    return ST_Rotate(ST_Envelope(ST_Rotate(g, angle_min, ctr)), -angle_min, ctr);
end;
$$;


ALTER FUNCTION public.orientedenvelope(g public.geometry) OWNER TO postgres;

--
-- TOC entry 963 (class 1255 OID 33010)
-- Name: sieve(public.geometry, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sieve(g public.geometry, area_threshold double precision) RETURNS public.geometry
    LANGUAGE sql IMMUTABLE
    AS $$
    with exploded as (
        -- First use ST_Dump to explode the input multipolygon
        -- to individual polygons.
        select (ST_Dump(g)).geom
    ), rings as (
        -- Next use ST_DumpRings to turn all of the inner and outer rings
        -- into their own separate polygons.
        select (ST_DumpRings(geom)).geom from exploded
    ) select
        -- Finally, build the multipolygon back up using only the rings
        -- that are larger than the specified threshold area.
            ST_SetSRID(ST_BuildArea(ST_Collect(geom)), ST_SRID(g))
        from rings
        where ST_Area(geom) > area_threshold;
$$;


ALTER FUNCTION public.sieve(g public.geometry, area_threshold double precision) OWNER TO postgres;

--
-- TOC entry 964 (class 1255 OID 33011)
-- Name: sieve(public.geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sieve(g public.geometry, area_threshold integer) RETURNS public.geometry
    LANGUAGE sql IMMUTABLE
    AS $$
    with exploded as (
        -- First use ST_Dump to explode the input multipolygon
        -- to individual polygons.
        select (ST_Dump(g)).geom
    ), rings as (
        -- Next use ST_DumpRings to turn all of the inner and outer rings
        -- into their own separate polygons.
        select (ST_DumpRings(geom)).geom from exploded
    ) select
        -- Finally, build the multipolygon back up using only the rings
        -- that are larger than the specified threshold area.
            ST_SetSRID(ST_BuildArea(ST_Collect(geom)), ST_SRID(g))
        from rings
        where ST_Area(geom) > area_threshold;
$$;


ALTER FUNCTION public.sieve(g public.geometry, area_threshold integer) OWNER TO postgres;

--
-- TOC entry 965 (class 1255 OID 33012)
-- Name: smartshrink(public.geometry, double precision, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.smartshrink(geom public.geometry, ratio double precision, simplify boolean DEFAULT false) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
    full_area float := ST_Area(geom);
    buf0 geometry;
    buf1 geometry := geom;
    d0 float := 0;
    d1 float := 2;
begin
    while ST_Area(buf1) > (full_area * ratio) loop
        d0 := d1;
        d1 := d1 * 2;
        buf0 := buf1;
        buf1 := ST_Buffer(geom, -d1, 'quad_segs=0');
    end loop;
    if simplify = true then
        return ST_SimplifyPreserveTopology(buf0, d0);
    else
        return buf0;
    end if;
end;
$$;


ALTER FUNCTION public.smartshrink(geom public.geometry, ratio double precision, simplify boolean) OWNER TO postgres;

--
-- TOC entry 966 (class 1255 OID 33013)
-- Name: tilebbox(integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tilebbox(z integer, x integer, y integer, srid integer DEFAULT 3857) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
    max numeric := 20037508.34;
    res numeric := (max*2)/(2^z);
    bbox geometry;
begin
    bbox := ST_MakeEnvelope(
        -max + (x * res),
        max - (y * res),
        -max + (x * res) + res,
        max - (y * res) - res,
        3857
    );
    if srid = 3857 then
        return bbox;
    else
        return ST_Transform(bbox, srid);
    end if;
end;
$$;


ALTER FUNCTION public.tilebbox(z integer, x integer, y integer, srid integer) OWNER TO postgres;

--
-- TOC entry 967 (class 1255 OID 33014)
-- Name: topoint(public.geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.topoint(g public.geometry) RETURNS public.geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    g := ST_MakeValid(g);
    if GeometryType(g) = 'POINT' then
        return g;
    elsif ST_IsEmpty(g) then
        -- This should not be necessary with Geos >= 3.3.7, but we're getting
        -- mystery MultiPoint objects from ST_MakeValid (or somewhere) when
        -- empty objects are input.
        return null;
    elsif (GeometryType(g) = 'POLYGON' OR GeometryType(g) = 'MULTIPOLYGON') and ST_NPoints(g) <= 5 then
        -- For simple polygons the centroid is good enough for label placement
        return ST_Centroid(g);
    else
        return ST_PointOnSurface(g);
    end if;
end;
$$;


ALTER FUNCTION public.topoint(g public.geometry) OWNER TO postgres;

--
-- TOC entry 970 (class 1255 OID 33017)
-- Name: z(numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.z(numeric) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
select
  case
    -- Don't bother if the scale is larger than ~zoom level 0
    when $1 > 600000000 or $1 = 0 then null
    else cast (round(log(2,559082264.028/$1)) as integer)
  end;
$_$;


ALTER FUNCTION public.z(numeric) OWNER TO postgres;

--
-- TOC entry 969 (class 1255 OID 33016)
-- Name: zres(double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.zres(z double precision) RETURNS double precision
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
select (40075016.6855785/(256*2^z));
$$;


ALTER FUNCTION public.zres(z double precision) OWNER TO postgres;

--
-- TOC entry 968 (class 1255 OID 33015)
-- Name: zres(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.zres(z integer) RETURNS double precision
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
select (40075016.6855785/(256*2^z));
$$;


ALTER FUNCTION public.zres(z integer) OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 162014)
-- Name: features; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.features (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
)
PARTITION BY LIST (layer_id);


ALTER TABLE geo.features OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 162096)
-- Name: features_3f82368a-71be-4580-9cfe-4effa958e811; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo."features_3f82368a-71be-4580-9cfe-4effa958e811" (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
);
ALTER TABLE ONLY geo.features ATTACH PARTITION geo."features_3f82368a-71be-4580-9cfe-4effa958e811" FOR VALUES IN ('3f82368a-71be-4580-9cfe-4effa958e811');


ALTER TABLE geo."features_3f82368a-71be-4580-9cfe-4effa958e811" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 162040)
-- Name: features_9a18dd94-be40-4755-95be-3ff4c47bdf3c; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo."features_9a18dd94-be40-4755-95be-3ff4c47bdf3c" (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
);
ALTER TABLE ONLY geo.features ATTACH PARTITION geo."features_9a18dd94-be40-4755-95be-3ff4c47bdf3c" FOR VALUES IN ('9a18dd94-be40-4755-95be-3ff4c47bdf3c');


ALTER TABLE geo."features_9a18dd94-be40-4755-95be-3ff4c47bdf3c" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 170200)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007acbb; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb" (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
);
ALTER TABLE ONLY geo.features ATTACH PARTITION geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb" FOR VALUES IN ('a938d5e3-150a-4591-acf5-6f7f1007acbb');


ALTER TABLE geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 170222)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84e3f; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f" (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
);
ALTER TABLE ONLY geo.features ATTACH PARTITION geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f" FOR VALUES IN ('ab371060-7c39-43e1-ab49-ab7beaa84e3f');


ALTER TABLE geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 162022)
-- Name: features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo."features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" (
    layer_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    feature_geometry public.geometry NOT NULL
);
ALTER TABLE ONLY geo.features ATTACH PARTITION geo."features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" FOR VALUES IN ('bbf4f434-fec9-403b-bf11-9f7e1a1b99d3');


ALTER TABLE geo."features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 31915)
-- Name: layers; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.layers (
    layer_id uuid NOT NULL,
    layer_name text,
    visible boolean NOT NULL,
    layer_type integer DEFAULT 0 NOT NULL
);


ALTER TABLE geo.layers OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 31936)
-- Name: map_layer; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.map_layer (
    map_id uuid NOT NULL,
    layer_id uuid NOT NULL
);


ALTER TABLE geo.map_layer OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 31923)
-- Name: maps; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.maps (
    map_id uuid NOT NULL,
    map_name text
);


ALTER TABLE geo.maps OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 162334)
-- Name: mvt; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.mvt (
    layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,
    pbf bytea
);


ALTER TABLE geo.mvt OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 32979)
-- Name: tiles_count; Type: TABLE; Schema: geo; Owner: postgres
--

CREATE TABLE geo.tiles_count (
    layer_id uuid NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,
    n integer NOT NULL
);


ALTER TABLE geo.tiles_count OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 162087)
-- Name: 3f82368a-71be-4580-9cfe-4effa958e811; Type: TABLE; Schema: layers; Owner: postgres
--

CREATE TABLE layers."3f82368a-71be-4580-9cfe-4effa958e811" (
    feature_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    feature_geometry public.geometry
);


ALTER TABLE layers."3f82368a-71be-4580-9cfe-4effa958e811" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 161989)
-- Name: 9a18dd94-be40-4755-95be-3ff4c47bdf3c; Type: TABLE; Schema: layers; Owner: postgres
--

CREATE TABLE layers."9a18dd94-be40-4755-95be-3ff4c47bdf3c" (
    feature_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    feature_geometry public.geometry
);


ALTER TABLE layers."9a18dd94-be40-4755-95be-3ff4c47bdf3c" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 170191)
-- Name: a938d5e3-150a-4591-acf5-6f7f1007acbb; Type: TABLE; Schema: layers; Owner: postgres
--

CREATE TABLE layers."a938d5e3-150a-4591-acf5-6f7f1007acbb" (
    feature_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    feature_geometry public.geometry
);


ALTER TABLE layers."a938d5e3-150a-4591-acf5-6f7f1007acbb" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 170213)
-- Name: ab371060-7c39-43e1-ab49-ab7beaa84e3f; Type: TABLE; Schema: layers; Owner: postgres
--

CREATE TABLE layers."ab371060-7c39-43e1-ab49-ab7beaa84e3f" (
    feature_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    feature_geometry public.geometry
);


ALTER TABLE layers."ab371060-7c39-43e1-ab49-ab7beaa84e3f" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 33026)
-- Name: bbf4f434-fec9-403b-bf11-9f7e1a1b99d3; Type: TABLE; Schema: layers; Owner: postgres
--

CREATE TABLE layers."bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" (
    feature_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    feature_geometry public.geometry
);


ALTER TABLE layers."bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" OWNER TO postgres;

--
-- TOC entry 3905 (class 2606 OID 162271)
-- Name: features PK_features; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.features
    ADD CONSTRAINT "PK_features" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3883 (class 2606 OID 162281)
-- Name: layers PK_layers; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.layers
    ADD CONSTRAINT "PK_layers" PRIMARY KEY (layer_id);


--
-- TOC entry 3891 (class 2606 OID 162283)
-- Name: map_layer PK_map_layer; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.map_layer
    ADD CONSTRAINT "PK_map_layer" PRIMARY KEY (map_id, layer_id);


--
-- TOC entry 3885 (class 2606 OID 162279)
-- Name: maps PK_maps; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.maps
    ADD CONSTRAINT "PK_maps" PRIMARY KEY (map_id);


--
-- TOC entry 3915 (class 2606 OID 162351)
-- Name: mvt PK_mvt; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.mvt
    ADD CONSTRAINT "PK_mvt" PRIMARY KEY (layer_id, x, y, z);


--
-- TOC entry 3888 (class 2606 OID 162285)
-- Name: tiles PK_tiles; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.tiles
    ADD CONSTRAINT "PK_tiles" PRIMARY KEY (layer_id, x, y, z);


--
-- TOC entry 3896 (class 2606 OID 162287)
-- Name: tiles_count PK_tiles_count; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.tiles_count
    ADD CONSTRAINT "PK_tiles_count" PRIMARY KEY (layer_id, x, y, z);


--
-- TOC entry 3913 (class 2606 OID 162273)
-- Name: features_3f82368a-71be-4580-9cfe-4effa958e811 features_3f82368a-71be-4580-9cfe-4effa958e811_pkey; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo."features_3f82368a-71be-4580-9cfe-4effa958e811"
    ADD CONSTRAINT "features_3f82368a-71be-4580-9cfe-4effa958e811_pkey" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3909 (class 2606 OID 162275)
-- Name: features_9a18dd94-be40-4755-95be-3ff4c47bdf3c features_9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo."features_9a18dd94-be40-4755-95be-3ff4c47bdf3c"
    ADD CONSTRAINT "features_9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3921 (class 2606 OID 170204)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007acbb features_a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb"
    ADD CONSTRAINT "features_a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3927 (class 2606 OID 170226)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84e3f features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f"
    ADD CONSTRAINT "features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3907 (class 2606 OID 162277)
-- Name: features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3 features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey; Type: CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo."features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3"
    ADD CONSTRAINT "features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey" PRIMARY KEY (layer_id, feature_id);


--
-- TOC entry 3911 (class 2606 OID 162095)
-- Name: 3f82368a-71be-4580-9cfe-4effa958e811 3f82368a-71be-4580-9cfe-4effa958e811_pkey; Type: CONSTRAINT; Schema: layers; Owner: postgres
--

ALTER TABLE ONLY layers."3f82368a-71be-4580-9cfe-4effa958e811"
    ADD CONSTRAINT "3f82368a-71be-4580-9cfe-4effa958e811_pkey" PRIMARY KEY (feature_id);


--
-- TOC entry 3901 (class 2606 OID 161997)
-- Name: 9a18dd94-be40-4755-95be-3ff4c47bdf3c 9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey; Type: CONSTRAINT; Schema: layers; Owner: postgres
--

ALTER TABLE ONLY layers."9a18dd94-be40-4755-95be-3ff4c47bdf3c"
    ADD CONSTRAINT "9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey" PRIMARY KEY (feature_id);


--
-- TOC entry 3917 (class 2606 OID 170199)
-- Name: a938d5e3-150a-4591-acf5-6f7f1007acbb a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey; Type: CONSTRAINT; Schema: layers; Owner: postgres
--

ALTER TABLE ONLY layers."a938d5e3-150a-4591-acf5-6f7f1007acbb"
    ADD CONSTRAINT "a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey" PRIMARY KEY (feature_id);


--
-- TOC entry 3923 (class 2606 OID 170221)
-- Name: ab371060-7c39-43e1-ab49-ab7beaa84e3f ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey; Type: CONSTRAINT; Schema: layers; Owner: postgres
--

ALTER TABLE ONLY layers."ab371060-7c39-43e1-ab49-ab7beaa84e3f"
    ADD CONSTRAINT "ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey" PRIMARY KEY (feature_id);


--
-- TOC entry 3898 (class 2606 OID 33034)
-- Name: bbf4f434-fec9-403b-bf11-9f7e1a1b99d3 bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey; Type: CONSTRAINT; Schema: layers; Owner: postgres
--

ALTER TABLE ONLY layers."bbf4f434-fec9-403b-bf11-9f7e1a1b99d3"
    ADD CONSTRAINT "bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey" PRIMARY KEY (feature_id);


--
-- TOC entry 3902 (class 1259 OID 162322)
-- Name: IX_features_geometry; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "IX_features_geometry" ON ONLY geo.features USING gist (feature_geometry);


--
-- TOC entry 3903 (class 1259 OID 162320)
-- Name: IX_features_layer; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "IX_features_layer" ON ONLY geo.features USING btree (layer_id);


--
-- TOC entry 3889 (class 1259 OID 162321)
-- Name: IX_map_layer; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "IX_map_layer" ON geo.map_layer USING btree (map_id, layer_id);


--
-- TOC entry 3894 (class 1259 OID 162325)
-- Name: IX_tiles_count_layer; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "IX_tiles_count_layer" ON geo.tiles_count USING btree (layer_id);


--
-- TOC entry 3886 (class 1259 OID 162324)
-- Name: IX_tiles_layer; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "IX_tiles_layer" ON geo.tiles USING btree (layer_id);


--
-- TOC entry 3918 (class 1259 OID 170206)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007a_feature_geometry_idx; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "features_a938d5e3-150a-4591-acf5-6f7f1007a_feature_geometry_idx" ON geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb" USING gist (feature_geometry);


--
-- TOC entry 3919 (class 1259 OID 170205)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007acbb_layer_id_idx; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "features_a938d5e3-150a-4591-acf5-6f7f1007acbb_layer_id_idx" ON geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb" USING btree (layer_id);


--
-- TOC entry 3924 (class 1259 OID 170228)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84_feature_geometry_idx; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "features_ab371060-7c39-43e1-ab49-ab7beaa84_feature_geometry_idx" ON geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f" USING gist (feature_geometry);


--
-- TOC entry 3925 (class 1259 OID 170227)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_layer_id_idx; Type: INDEX; Schema: geo; Owner: postgres
--

CREATE INDEX "features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_layer_id_idx" ON geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f" USING btree (layer_id);


--
-- TOC entry 3899 (class 1259 OID 161999)
-- Name: feature_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_idx; Type: INDEX; Schema: layers; Owner: postgres
--

CREATE INDEX "feature_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_idx" ON layers."bbf4f434-fec9-403b-bf11-9f7e1a1b99d3" USING gist (feature_geometry);


--
-- TOC entry 3930 (class 0 OID 0)
-- Name: features_3f82368a-71be-4580-9cfe-4effa958e811_pkey; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."PK_features" ATTACH PARTITION geo."features_3f82368a-71be-4580-9cfe-4effa958e811_pkey";


--
-- TOC entry 3929 (class 0 OID 0)
-- Name: features_9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."PK_features" ATTACH PARTITION geo."features_9a18dd94-be40-4755-95be-3ff4c47bdf3c_pkey";


--
-- TOC entry 3931 (class 0 OID 0)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007a_feature_geometry_idx; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."IX_features_geometry" ATTACH PARTITION geo."features_a938d5e3-150a-4591-acf5-6f7f1007a_feature_geometry_idx";


--
-- TOC entry 3932 (class 0 OID 0)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007acbb_layer_id_idx; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."IX_features_layer" ATTACH PARTITION geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb_layer_id_idx";


--
-- TOC entry 3933 (class 0 OID 0)
-- Name: features_a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."PK_features" ATTACH PARTITION geo."features_a938d5e3-150a-4591-acf5-6f7f1007acbb_pkey";


--
-- TOC entry 3934 (class 0 OID 0)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84_feature_geometry_idx; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."IX_features_geometry" ATTACH PARTITION geo."features_ab371060-7c39-43e1-ab49-ab7beaa84_feature_geometry_idx";


--
-- TOC entry 3935 (class 0 OID 0)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_layer_id_idx; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."IX_features_layer" ATTACH PARTITION geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_layer_id_idx";


--
-- TOC entry 3936 (class 0 OID 0)
-- Name: features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."PK_features" ATTACH PARTITION geo."features_ab371060-7c39-43e1-ab49-ab7beaa84e3f_pkey";


--
-- TOC entry 3928 (class 0 OID 0)
-- Name: features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey; Type: INDEX ATTACH; Schema: geo; Owner: postgres
--

ALTER INDEX geo."PK_features" ATTACH PARTITION geo."features_bbf4f434-fec9-403b-bf11-9f7e1a1b99d3_pkey";


--
-- TOC entry 3943 (class 2620 OID 162086)
-- Name: layers update_layer; Type: TRIGGER; Schema: geo; Owner: postgres
--

CREATE TRIGGER update_layer AFTER INSERT OR DELETE ON geo.layers FOR EACH ROW EXECUTE FUNCTION geo.update_layer();


--
-- TOC entry 3941 (class 2606 OID 162288)
-- Name: features FK_features_layer; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE geo.features
    ADD CONSTRAINT "FK_features_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);


--
-- TOC entry 3938 (class 2606 OID 162300)
-- Name: map_layer FK_map_layer_layer; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.map_layer
    ADD CONSTRAINT "FK_map_layer_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id) ON DELETE CASCADE;


--
-- TOC entry 3939 (class 2606 OID 162305)
-- Name: map_layer FK_map_layer_map; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.map_layer
    ADD CONSTRAINT "FK_map_layer_map" FOREIGN KEY (map_id) REFERENCES geo.maps(map_id) ON DELETE CASCADE;


--
-- TOC entry 3942 (class 2606 OID 162340)
-- Name: mvt FK_mvt_layer; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.mvt
    ADD CONSTRAINT "FK_mvt_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);


--
-- TOC entry 3940 (class 2606 OID 162310)
-- Name: tiles_count FK_tiles_count_layer; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.tiles_count
    ADD CONSTRAINT "FK_tiles_count_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);


--
-- TOC entry 3937 (class 2606 OID 162315)
-- Name: tiles FK_tiles_layer; Type: FK CONSTRAINT; Schema: geo; Owner: postgres
--

ALTER TABLE ONLY geo.tiles
    ADD CONSTRAINT "FK_tiles_layer" FOREIGN KEY (layer_id) REFERENCES geo.layers(layer_id);


-- Completed on 2021-03-26 17:24:34

--
-- PostgreSQL database dump complete
--

