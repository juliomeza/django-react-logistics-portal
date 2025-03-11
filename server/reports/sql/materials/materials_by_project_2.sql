SELECT 
    p.name Project, 
	m.lookupCode Material, 
    m.description 'Material Description'
FROM 
    datex_footprint.Materials m
JOIN 
    datex_footprint.Projects p ON m.projectId = p.id
WHERE
    p.lookupCode = ?