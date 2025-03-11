SELECT 
    m.id, 
    m.projectId, 
    m.lookupCode
FROM 
    datex_footprint.Materials m
JOIN 
    datex_footprint.Projects p ON m.projectId = p.id
WHERE
    p.lookupCode = %s