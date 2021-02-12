CREATE OR REPLACE FUNCTION geo.get_box_tiles(
	layers text[],
	xmin double precision,
	ymin double precision,
	xmax double precision,
	ymax double precision)
    RETURNS SETOF geo.tiles 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$
DECLARE	
	w float := 40075016.685578496;
	h float := w / 2;
	b box2d := ST_SetSRID(ST_MakeBox2D(ST_Point(xmin, ymin),ST_Point(xmax, ymax)), 3857);
BEGIN	
	RETURN QUERY
	SELECT *
	FROM geo.tiles
	WHERE ST_Intersects(ST_MakeBox2D(ST_Point(geo.tile_x_merc(x, z), geo.tile_y_merc(y, z)), ST_Point(geo.tile_x_merc(x + 1, z), geo.tile_y_merc(y + 1, z))), b);
END;
$BODY$;
