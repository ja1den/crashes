SELECT 
    crashes.id,
    regions.name AS region,
    suburbs.name AS suburb,
    postcode,
    units,
    fatalities,
    injuries,
    date,
    time,
    speed_limit,
    road_types.name AS road_type,
    curves.name AS curve,
    slopes.name AS slope,
    surfaces.name AS surface,
    dry,
    raining,
    day,
    crash_types.name AS crash_type,
    alcohol,
    drugs
FROM
    crashes.crashes
        LEFT JOIN
    regions ON crashes.region_id = regions.id
        LEFT JOIN
    suburbs ON crashes.suburb_id = suburbs.id
        LEFT JOIN
    road_types ON crashes.road_type_id = road_types.id
        LEFT JOIN
    curves ON crashes.curve_id = curves.id
        LEFT JOIN
    slopes ON crashes.slope_id = slopes.id
        LEFT JOIN
    surfaces ON crashes.surface_id = surfaces.id
        LEFT JOIN
    crash_types ON crashes.crash_type_id = crash_types.id
ORDER BY crashes.id;
