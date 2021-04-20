SELECT 
    COUNT(crashes.id) AS total,
    SUM(crashes.fatalities) AS fatalities,
    SUM(crashes.injuries) AS injuries,
    SUM(crashes.units) AS units
FROM
    crashes.crashes;
