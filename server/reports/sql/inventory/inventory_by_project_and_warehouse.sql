SELECT
    I.projectLookupCode 'Project Lookup Code',
    I.materialName 'Material Code',
    I.materialDescription 'Material Name',
    I.lotLookupCode Lot,
    I.licensePlateLookupCode 'License Plate',
    I.activeAmount 'Available Quantity',
    imu.name AS UOM,
    I.warehouseName AS warehouse
FROM
    datex_footprint.InventoryDetailedView AS I
INNER JOIN
    datex_footprint_reporting.MaterialsPackagingsLookupView AS mpl
        ON I.materialId = mpl.materialId AND mpl.isBasePackaging = 1
INNER JOIN
    datex_footprint_reporting.InventoryMeasurementUnitsView AS imu
        ON mpl.packagingId = imu.id
INNER JOIN
    datex_footprint.LicensePlates AS LP
        ON I.licensePlateLookupCode = LP.lookupCode
WHERE
  I.projectLookupCode = ?
  --I.projectId = 383
  AND I.lotLookupCode NOT LIKE 'test%'
  AND I.materialStatusId = 1
  AND I.lotStatusId = 1
  AND I.locationStatusId = 1
  AND I.licensePlateStatusId = 1
  AND I.activeAmount > 0
  AND LP.archived = 0