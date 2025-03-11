SELECT 
    m.id 'Material ID', 
    m.projectId 'Project ID', 
    m.lookupCode 'Material Code'
FROM 
    datex_footprint.Materials m
JOIN 
    datex_footprint.Projects p ON m.projectId = p.id
WHERE
    p.lookupCode = ?