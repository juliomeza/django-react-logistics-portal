-- reports/sql/shipments/shipments_last_30_days.sql
-- Reporte: Envíos de los últimos 30 días
-- Descripción: Muestra los envíos realizados en los últimos 30 días
-- Parámetros: lookup_code del proyecto (filtro obligatorio)

SELECT 
    s.id AS 'Shipment ID',
    s.lookupCode AS 'Shipment Code',
    s.shippedDate AS 'Shipped Date',
    s.createdSysDateTime AS 'Created Date',
    s.trackingIdentifier AS 'Tracking Number',
    o.lookupCode AS 'Order Code',
    o.ownerReference AS 'Owner Reference',
    o.vendorReference AS 'Vendor Reference',
    a.name AS 'Account Name',
    a.lookupCode AS 'Account Code',
    p.name AS 'Project Name',
    p.lookupCode AS 'Project Code',
    c.name AS 'Carrier Name',
    cst.name AS 'Service Type',
    --addr.line1 AS 'Ship To Line1',
    --addr.line2 AS 'Ship To Line2',
    --addr.city AS 'Ship To City',
    --addr.state AS 'Ship To State',
    --addr.postalCode AS 'Ship To Postal Code',
    --addr.country AS 'Ship To Country',
    sl.materialName AS 'Material Name',
    sl.materialLookupCode AS 'Material Code',
    sl.amount AS 'Quantity',
    s.billOfLading AS 'BOL',
    ss.name AS 'Status'
FROM 
    datex_footprint.Shipments s
    INNER JOIN datex_footprint.ShipmentOrderLookup so ON so.shipmentId = s.id
    INNER JOIN datex_footprint.Orders o ON o.id = so.orderId
    INNER JOIN datex_footprint.Projects p ON p.id = o.projectId
    LEFT JOIN datex_footprint.Accounts a ON a.id = ISNULL(s.accountId, o.accountId)
    LEFT JOIN datex_footprint.Carriers c ON c.id = s.carrierId
    LEFT JOIN datex_footprint.CarrierServiceTypes cst ON cst.id = s.carrierServiceTypeId
    LEFT JOIN datex_footprint.ShipmentStatuses ss ON ss.id = s.statusId
    --LEFT JOIN datex_footprint.Addresses addr ON addr.id = s.shipToAddressId
    OUTER APPLY woodfield_reporting.ePortal_PackingSlipLines_Function(s.id) sl
WHERE
    p.lookupCode = ?  -- Filtro por proyecto (parámetro obligatorio)
    AND s.shippedDate >= DATEADD(day, -30, GETDATE())  -- Últimos 30 días
    AND s.statusId = 8  -- Solo envíos completados
    AND s.typeId = 2  -- Solo envíos de salida
    AND ISNULL(s.trackingIdentifier, '') <> N'VOID'  -- Excluir envíos anulados
ORDER BY
    s.shippedDate DESC;