SELECT 
    p.name, 
	m.lookupCode, 
    m.description
FROM 
    datex_footprint.Materials m
JOIN 
    datex_footprint.Projects p ON m.projectId = p.id
WHERE
    p.lookupCode = ?