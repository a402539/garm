--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.4
-- Dumped by pg_dump version 9.5.4

-- Started on 2021-02-12 18:56:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 9 (class 2615 OID 103752)
-- Name: cat; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA cat;


ALTER SCHEMA cat OWNER TO postgres;

--
-- TOC entry 1 (class 3079 OID 12355)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 2 (class 3079 OID 102199)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET search_path = cat, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 204 (class 1259 OID 106980)
-- Name: tiles; Type: TABLE; Schema: cat; Owner: postgres
--

CREATE TABLE tiles (
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL
);


ALTER TABLE tiles OWNER TO postgres;

--
-- TOC entry 1440 (class 1255 OID 106993)
-- Name: get_box2d_tiles(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION get_box2d_tiles(xmin double precision, ymin double precision, xmax double precision, ymax double precision) RETURNS SETOF tiles
    LANGUAGE plpgsql
    AS $$
DECLARE	
	w float := 40075016.685578496;
	h float := w / 2;
	b box2d := ST_SetSRID(ST_MakeBox2D(ST_Point(xmin, ymin),ST_Point(xmax, ymax)), 3857);
BEGIN	
	RETURN QUERY
	SELECT *
	FROM cat.tiles
	WHERE ST_Intersects(ST_MakeBox2D(ST_Point(cat.tile_x_merc(x, z), cat.tile_y_merc(y, z)), ST_Point(cat.tile_x_merc(x + 1, z), cat.tile_y_merc(y + 1, z))), b);
END;
$$;


ALTER FUNCTION cat.get_box2d_tiles(xmin double precision, ymin double precision, xmax double precision, ymax double precision) OWNER TO postgres;

--
-- TOC entry 1443 (class 1255 OID 106992)
-- Name: get_optimized_tiles(integer, integer, integer, integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION get_optimized_tiles(vx integer, vy integer, vz integer, zmax integer, threshold integer) RETURNS tiles[]
    LANGUAGE plpgsql
    AS $$
DECLARE
	tt cat.tiles[];
	tiles cat.tiles[] := ARRAY[]::cat.tiles[];
	vt RECORD;
BEGIN	
	IF vz <= zmax THEN		
		tt := ARRAY(SELECT (x,y,z) FROM cat.tile_count WHERE (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n <= threshold);
		IF array_length(tt, 1) > 0 THEN
			tiles := array_cat(tiles, tt);		
		END IF;
		
		FOR vt IN
			SELECT x,y FROM cat.tile_count WHERE (vx IS NULL OR x = vx) AND (vy IS NULL OR y = vy) AND z = vz AND n > threshold
		LOOP			
			tt := cat.get_optimized_tiles(vt.x * 2, vt.y * 2, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := cat.get_optimized_tiles(vt.x * 2 + 1,vt.y * 2, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := cat.get_optimized_tiles(vt.x * 2,vt.y * 2 + 1, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;
			tt := cat.get_optimized_tiles(vt.x * 2 + 1,vt.y * 2 + 1, vz + 1, zmax, threshold);
			IF array_length(tt, 1) > 0 THEN
				tiles := array_cat(tiles, tt);		
			END IF;			
		END LOOP;	
	END IF;
	
	RETURN tiles;
END;
$$;


ALTER FUNCTION cat.get_optimized_tiles(vx integer, vy integer, vz integer, zmax integer, threshold integer) OWNER TO postgres;

--
-- TOC entry 1439 (class 1255 OID 106995)
-- Name: get_tiles(public.geometry, integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION get_tiles(g public.geometry, zmin integer, zmax integer) RETURNS tiles[]
    LANGUAGE plpgsql
    AS $$

DECLARE
	b box2d := Box2D(g);
	xmin float := ST_XMin(b);
	xmax float := ST_XMax(b);
	ymin float := ST_YMin(b);
	ymax float := ST_YMax(b);
	w float := 40075016.685578496;
	h float := w / 2;	
	n int := power(2, zmax);
	tiles cat.tiles[] := ARRAY[]::cat.tiles[];	
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
				tiles := array_append(tiles, (x, y, z)::cat.tiles);
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


ALTER FUNCTION cat.get_tiles(g public.geometry, zmin integer, zmax integer) OWNER TO postgres;

--
-- TOC entry 1419 (class 1255 OID 103754)
-- Name: ls_bulk(json); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION ls_bulk(res json) RETURNS void
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
		st_transform(st_setsrid(st_geomfromgeojson(concat('{"type": "Polygon", "coordinates":', '[[[', R->>'upperleftcornerlongitude', ',', R->>'upperleftcornerlatitude', '],[', R->>'upperrightcornerlongitude', ',', R->>'upperrightcornerlatitude', '],[', R->>'lowerrightcornerlongitude', ',', R->>'lowerrightcornerlatitude', '],[', R->>'lowerleftcornerlongitude', ',', R->>'lowerleftcornerlatitude', '],[', R->>'upperleftcornerlongitude', ',', R->>'upperleftcornerlatitude', ']]]}')), 4326), 3857)
	FROM UNNEST(items) AS R;
	
	INSERT INTO cat.ls8 (
		browseavailable,
		browseurl,
		sceneid,
		sensor,
		acquisitiondate,
		dateupdated,
		"path",
		"row",
		upperleftcornerlatitude,
		upperleftcornerlongitude,
		upperrightcornerlatitude,
		upperrightcornerlongitude,
		lowerleftcornerlatitude,
		lowerleftcornerlongitude,
		lowerrightcornerlatitude,
		lowerrightcornerlongitude,
		scenecenterlatitude,
		scenecenterlongitude,
		cloudcover,
		--cloudcoverfull,
		dayornight,
		sunelevation,
		sunazimuth,
		receivingstation,
		scenestarttime,
		scenestoptime,
		imagequality1,
		data_type_l1,
		carturl,
		roll_angle,
		geometric_rmse_model_x,
		geometric_rmse_model_y,
		--full_partial_scene,
		nadir_offnadir,
		processing_software_version,
		cpf_name,
		rlut_file_name,
		bpf_name_oli,
		bpf_name_tirs,
		wkb,
		landsat_product_id
	)
	SELECT
		browseavailable,
		browseurl,
		sceneid,
		sensor,
		acquisitiondate,
		dateupdated,
		"path",
		"row",
		upperleftcornerlatitude,
		upperleftcornerlongitude,
		upperrightcornerlatitude,
		upperrightcornerlongitude,
		lowerleftcornerlatitude,
		lowerleftcornerlongitude,
		lowerrightcornerlatitude,
		lowerrightcornerlongitude,
		scenecenterlatitude,
		scenecenterlongitude,
		cloudcover,
		--cloudcoverfull,
		dayornight,
		sunelevation,
		sunazimuth,
		receivingstation,
		scenestarttime,
		scenestoptime,
		imagequality1,
		data_type_l1,
		carturl,
		roll_angle,
		geometric_rmse_model_x,
		geometric_rmse_model_y,
		--full_partial_scene,
		nadir_offnadir,
		processing_software_version,
		cpf_name,
		rlut_file_name,
		bpf_name_oli,
		bpf_name_tirs,
		geom,
		landsat_product_id		
	FROM lst8
	ON CONFLICT DO NOTHING;
		
END;
$$;


ALTER FUNCTION cat.ls_bulk(res json) OWNER TO postgres;

--
-- TOC entry 1442 (class 1255 OID 106979)
-- Name: mvt_ls8_tile(integer, integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION mvt_ls8_tile(x integer, y integer, z integer, OUT mvt bytea) RETURNS bytea
    LANGUAGE sql
    AS $$
SELECT ST_AsMVT(q, 'ls8', 4096, 'geom')
         FROM (
                 SELECT
                 uid,
                 ST_AsMVTGeom(
                         wkb,
                         TileBBox(z, x, y),
                         4096,
                         256,
                         false
                 ) geom
                 FROM cat.ls8
                 WHERE wkb && TileBBox(z, x, y)
                 AND ST_Intersects(wkb, TileBBox(z, x, y))
         ) q;
$$;


ALTER FUNCTION cat.mvt_ls8_tile(x integer, y integer, z integer, OUT mvt bytea) OWNER TO postgres;

--
-- TOC entry 1446 (class 1255 OID 106998)
-- Name: tile_x_merc(integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION tile_x_merc(x integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE STRICT COST 1
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN w * x / power(2, z) - h;
END;
$$;


ALTER FUNCTION cat.tile_x_merc(x integer, z integer) OWNER TO postgres;

--
-- TOC entry 1441 (class 1255 OID 106991)
-- Name: tile_y_merc(integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION tile_y_merc(y integer, z integer) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE STRICT COST 1
    AS $$
DECLARE
	w float := 40075016.685578496;
	h float := w / 2;
BEGIN		
	RETURN h - w * y / power(2, z);
END;
$$;


ALTER FUNCTION cat.tile_y_merc(y integer, z integer) OWNER TO postgres;

--
-- TOC entry 1444 (class 1255 OID 106996)
-- Name: update_tile_count(integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION update_tile_count(zmax integer) RETURNS void
    LANGUAGE sql
    AS $$
	DELETE FROM cat.tile_count;
	INSERT INTO cat.tile_count
	SELECT B.x, B.y, B.z, count(A.uid)
	FROM cat.ls8 A, UNNEST(cat.get_tiles(A.wkb, 0, zmax)) B
	GROUP BY B.x, B.y, B.z;
$$;


ALTER FUNCTION cat.update_tile_count(zmax integer) OWNER TO postgres;

--
-- TOC entry 1445 (class 1255 OID 106997)
-- Name: update_tiles(integer, integer); Type: FUNCTION; Schema: cat; Owner: postgres
--

CREATE FUNCTION update_tiles(zmax integer, threshold integer) RETURNS void
    LANGUAGE sql
    AS $$
	DELETE FROM cat.tiles;
	INSERT INTO cat.tiles
	SELECT * FROM UNNEST (cat.get_optimized_tiles(NULL, NULL, 0, zmax, threshold));
$$;


ALTER FUNCTION cat.update_tiles(zmax integer, threshold integer) OWNER TO postgres;

SET search_path = public, pg_catalog;

--
-- TOC entry 1420 (class 1255 OID 103733)
-- Name: bounds(geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION bounds(g geometry, srid integer DEFAULT NULL::integer) RETURNS double precision[]
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


ALTER FUNCTION public.bounds(g geometry, srid integer) OWNER TO postgres;

--
-- TOC entry 1421 (class 1255 OID 103734)
-- Name: cleanint(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION cleanint(i text) RETURNS integer
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
-- TOC entry 1422 (class 1255 OID 103735)
-- Name: cleannumeric(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION cleannumeric(i text) RETURNS numeric
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
-- TOC entry 1423 (class 1255 OID 103736)
-- Name: labelgrid(geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION labelgrid(g geometry, grid_size numeric) RETURNS text
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


ALTER FUNCTION public.labelgrid(g geometry, grid_size numeric) OWNER TO postgres;

--
-- TOC entry 1424 (class 1255 OID 103737)
-- Name: largestpart(geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION largestpart(g geometry) RETURNS geometry
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


ALTER FUNCTION public.largestpart(g geometry) OWNER TO postgres;

--
-- TOC entry 1425 (class 1255 OID 103738)
-- Name: linelabel(numeric, text, geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION linelabel(zoom numeric, label text, g geometry) RETURNS boolean
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


ALTER FUNCTION public.linelabel(zoom numeric, label text, g geometry) OWNER TO postgres;

--
-- TOC entry 1426 (class 1255 OID 103739)
-- Name: makearc(geometry, geometry, geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION makearc(p0 geometry, p1 geometry, p2 geometry, srid integer DEFAULT NULL::integer) RETURNS geometry
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


ALTER FUNCTION public.makearc(p0 geometry, p1 geometry, p2 geometry, srid integer) OWNER TO postgres;

--
-- TOC entry 1427 (class 1255 OID 103740)
-- Name: mercbuffer(geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION mercbuffer(g geometry, distance numeric) RETURNS geometry
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_Buffer(
        g,
        distance / cos(radians(ST_Y(ST_Transform(ST_Centroid(g),4326))))
    );
end;
$$;


ALTER FUNCTION public.mercbuffer(g geometry, distance numeric) OWNER TO postgres;

--
-- TOC entry 1428 (class 1255 OID 103741)
-- Name: mercdwithin(geometry, geometry, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION mercdwithin(g1 geometry, g2 geometry, distance numeric) RETURNS boolean
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


ALTER FUNCTION public.mercdwithin(g1 geometry, g2 geometry, distance numeric) OWNER TO postgres;

--
-- TOC entry 1429 (class 1255 OID 103742)
-- Name: merclength(geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION merclength(g geometry) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
    return ST_Length(g) * cos(radians(ST_Y(ST_Transform(ST_Centroid(g),4326))));
end;
$$;


ALTER FUNCTION public.merclength(g geometry) OWNER TO postgres;

--
-- TOC entry 1430 (class 1255 OID 103743)
-- Name: orientedenvelope(geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION orientedenvelope(g geometry) RETURNS geometry
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


ALTER FUNCTION public.orientedenvelope(g geometry) OWNER TO postgres;

--
-- TOC entry 1431 (class 1255 OID 103744)
-- Name: sieve(geometry, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION sieve(g geometry, area_threshold double precision) RETURNS geometry
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


ALTER FUNCTION public.sieve(g geometry, area_threshold double precision) OWNER TO postgres;

--
-- TOC entry 1432 (class 1255 OID 103745)
-- Name: sieve(geometry, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION sieve(g geometry, area_threshold integer) RETURNS geometry
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


ALTER FUNCTION public.sieve(g geometry, area_threshold integer) OWNER TO postgres;

--
-- TOC entry 1433 (class 1255 OID 103746)
-- Name: smartshrink(geometry, double precision, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION smartshrink(geom geometry, ratio double precision, simplify boolean DEFAULT false) RETURNS geometry
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


ALTER FUNCTION public.smartshrink(geom geometry, ratio double precision, simplify boolean) OWNER TO postgres;

--
-- TOC entry 1434 (class 1255 OID 103747)
-- Name: tilebbox(integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION tilebbox(z integer, x integer, y integer, srid integer DEFAULT 3857) RETURNS geometry
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
-- TOC entry 1435 (class 1255 OID 103748)
-- Name: topoint(geometry); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION topoint(g geometry) RETURNS geometry
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


ALTER FUNCTION public.topoint(g geometry) OWNER TO postgres;

--
-- TOC entry 1438 (class 1255 OID 103751)
-- Name: z(numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION z(numeric) RETURNS integer
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
-- TOC entry 1437 (class 1255 OID 103750)
-- Name: zres(double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION zres(z double precision) RETURNS double precision
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
select (40075016.6855785/(256*2^z));
$$;


ALTER FUNCTION public.zres(z double precision) OWNER TO postgres;

--
-- TOC entry 1436 (class 1255 OID 103749)
-- Name: zres(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION zres(z integer) RETURNS double precision
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
select (40075016.6855785/(256*2^z));
$$;


ALTER FUNCTION public.zres(z integer) OWNER TO postgres;

SET search_path = cat, pg_catalog;

--
-- TOC entry 202 (class 1259 OID 103755)
-- Name: ls8_uid_seq; Type: SEQUENCE; Schema: cat; Owner: postgres
--

CREATE SEQUENCE ls8_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE ls8_uid_seq OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 103757)
-- Name: ls8; Type: TABLE; Schema: cat; Owner: postgres
--

CREATE TABLE ls8 (
    browseavailable character(1),
    browseurl character varying(4000),
    sceneid character varying(4000) NOT NULL,
    sensor character varying(4000),
    acquisitiondate date,
    dateupdated date,
    path integer,
    "row" integer,
    upperleftcornerlatitude double precision,
    upperleftcornerlongitude double precision,
    upperrightcornerlatitude double precision,
    upperrightcornerlongitude double precision,
    lowerleftcornerlatitude double precision,
    lowerleftcornerlongitude double precision,
    lowerrightcornerlatitude double precision,
    lowerrightcornerlongitude double precision,
    scenecenterlatitude double precision,
    scenecenterlongitude double precision,
    cloudcover double precision,
    cloudcoverfull double precision,
    dayornight character varying(4000),
    sunelevation double precision,
    sunazimuth double precision,
    receivingstation character varying(4000),
    scenestarttime timestamp without time zone,
    scenestoptime timestamp without time zone,
    imagequality1 integer,
    data_type_l1 character varying(4000),
    carturl character varying(4000),
    roll_angle integer,
    geometric_rmse_model_x integer,
    geometric_rmse_model_y integer,
    full_partial_scene character varying(4000),
    nadir_offnadir character varying(4000),
    processing_software_version character varying(4000),
    cpf_name character varying(4000),
    rlut_file_name character varying(4000),
    bpf_name_oli character varying(4000),
    bpf_name_tirs character varying(4000),
    wkb public.geometry,
    uid integer DEFAULT nextval('ls8_uid_seq'::regclass) NOT NULL,
    landsat_product_id character varying(4000)
);


ALTER TABLE ls8 OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 106985)
-- Name: tile_count; Type: TABLE; Schema: cat; Owner: postgres
--

CREATE TABLE tile_count (
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL,
    n integer
);


ALTER TABLE tile_count OWNER TO postgres;

--
-- TOC entry 3455 (class 2606 OID 103765)
-- Name: ls8_id_pkey; Type: CONSTRAINT; Schema: cat; Owner: postgres
--

ALTER TABLE ONLY ls8
    ADD CONSTRAINT ls8_id_pkey PRIMARY KEY (uid);


--
-- TOC entry 3457 (class 2606 OID 103767)
-- Name: ls8_sceneid_unique; Type: CONSTRAINT; Schema: cat; Owner: postgres
--

ALTER TABLE ONLY ls8
    ADD CONSTRAINT ls8_sceneid_unique UNIQUE (sceneid);


--
-- TOC entry 3461 (class 2606 OID 106989)
-- Name: tile_count_pkey; Type: CONSTRAINT; Schema: cat; Owner: postgres
--

ALTER TABLE ONLY tile_count
    ADD CONSTRAINT tile_count_pkey PRIMARY KEY (x, y, z);


--
-- TOC entry 3459 (class 2606 OID 106984)
-- Name: tiles_pkey; Type: CONSTRAINT; Schema: cat; Owner: postgres
--

ALTER TABLE ONLY tiles
    ADD CONSTRAINT tiles_pkey PRIMARY KEY (x, y, z);


--
-- TOC entry 3453 (class 1259 OID 103768)
-- Name: idx_ls8_wkb; Type: INDEX; Schema: cat; Owner: postgres
--

CREATE INDEX idx_ls8_wkb ON ls8 USING gist (wkb);


--
-- TOC entry 3589 (class 0 OID 0)
-- Dependencies: 7
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2021-02-12 18:56:29

--
-- PostgreSQL database dump complete
--

