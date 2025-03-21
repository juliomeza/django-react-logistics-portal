# views.py
import pyodbc
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ReportDefinition
from .serializers import ReportDefinitionSerializer
from .report_manager import SQLReportManager

# Configuración de conexión a SQL Server
SQL_SERVER = 'WD02'
SQL_DATABASE = 'FootPrint'
SQL_DRIVER = 'ODBC Driver 17 for SQL Server'

class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los reportes
    """
    queryset = ReportDefinition.objects.all()
    serializer_class = ReportDefinitionSerializer
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.report_manager = SQLReportManager()

    def get_sql_connection(self):
        """
        Establece una conexión directa a SQL Server usando pyodbc
        """
        connection_string = f"""
            DRIVER={{{SQL_DRIVER}}};
            SERVER={SQL_SERVER};
            DATABASE={SQL_DATABASE};
            Trusted_Connection=yes;
        """
        return pyodbc.connect(connection_string)

    @action(detail=True, methods=['get'])
    def execute(self, request, pk=None):
        """
        Ejecuta una consulta desde un archivo SQL y devuelve los resultados
        """
        try:
            # Obtener el reporte
            report = self.get_object()
            
            # Parámetros para la consulta
            params = []
            
            # Si el reporte requiere filtro por proyecto
            if report.requires_project_filter:
                # Obtener el proyecto asociado al usuario
                user_projects = request.user.projects.all()
                if not user_projects.exists():
                    return Response({'error': 'User has no associated projects'}, 
                                  status=status.HTTP_403_FORBIDDEN)
                
                project = user_projects.first()  # Si hay múltiples, tomamos el primero
                lookup_code = project.lookup_code
                params.append(lookup_code)
            
            # Ejecutar una consulta desde el archivo SQL
            conn = self.get_sql_connection()
            columns, results = self.report_manager.execute_sql_report(
                conn,
                report.category,
                report.file_path,
                params=params if params else None
            )
            conn.close()
            
            # Preparar respuesta
            response_data = {
                'columns': columns,
                'results': results
            }
            
            # Añadir info del proyecto si corresponde
            if report.requires_project_filter and 'project' in locals():
                response_data['project'] = {
                    'id': project.id,
                    'name': project.name,
                    'lookup_code': project.lookup_code
                }
            
            return Response(response_data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            error_details = {
                'message': str(e),
                'traceback': traceback.format_exc()
            }
            return Response({'error': error_details}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='inventory')
    def inventory_by_project(self, request):
        """Get inventory data for user's project with optional order type filter"""
        try:
            # Get query parameters
            order_type = request.query_params.get('order_type', 'outbound')
            
            # Get user's project
            user_projects = request.user.projects.all()
            if not user_projects.exists():
                return Response({'error': 'User has no associated projects'}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            project = user_projects.first()  # Use first project if multiple
            lookup_code = project.lookup_code
            
            # Build the SQL query directly
            sql = """
            SELECT
                I.projectLookupCode AS 'Project Lookup Code',
                I.materialName AS 'Material Code',
                I.materialDescription AS 'Material Name',
                I.lotLookupCode AS Lot,
                I.licensePlateLookupCode AS 'License Plate',
                I.activeAmount AS 'Available Quantity',
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
              AND I.lotLookupCode NOT LIKE 'test%'
              AND I.materialStatusId = 1
              AND I.lotStatusId = 1
              AND I.locationStatusId = 1
              AND I.licensePlateStatusId = 1
              AND LP.archived = 0
            """
            
            # Add quantity filter for outbound orders
            if order_type.lower() == 'outbound':
                sql += " AND I.activeAmount > 0"
            
            # Execute the query
            conn = self.get_sql_connection()
            cursor = conn.cursor()
            cursor.execute(sql, [lookup_code])
            
            # Get column names and results
            columns = [column[0] for column in cursor.description]
            
            # Construct results dictionary
            results = []
            for row in cursor.fetchall():
                # Handle datetime values for JSON serialization
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'isoformat'):  # Si es una fecha/hora
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                results.append(row_dict)
            
            conn.close()
            
            # Return response
            return Response({
                'columns': columns,
                'results': results,
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'lookup_code': project.lookup_code
                }
            })
        except Exception as e:
            import traceback
            error_details = {
                'message': str(e),
                'traceback': traceback.format_exc()
            }
            return Response({'error': error_details}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)