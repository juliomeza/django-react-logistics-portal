import pyodbc
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ReportDefinition
from .serializers import ReportDefinitionSerializer

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
        Ejecuta una consulta y devuelve los resultados
        """
        try:
            # Obtener el proyecto asociado al usuario
            user_projects = request.user.projects.all()
            if not user_projects.exists():
                return Response({'error': 'User has no associated projects'}, status=status.HTTP_403_FORBIDDEN)
            
            project = user_projects.first()  # Si hay múltiples, tomamos el primero
            lookup_code = project.lookup_code
            
            # Obtener el reporte
            report = self.get_object()
            
            # Ejecutar una consulta directa que usa el lookup_code
            conn = self.get_sql_connection()
            cursor = conn.cursor()
            
            # Para el reporte específico con ID=1, usamos esta consulta
            if int(pk) == 1:
                # Consulta para materiales filtrados por el lookup_code del proyecto
                query = """
                SELECT 
                    m.id, 
                    m.projectId, 
                    m.lookupCode
                FROM 
                    datex_footprint.Materials m
                JOIN 
                    datex_footprint.Projects p ON m.projectId = p.id
                WHERE
                    p.lookupCode = ?
                """
                cursor.execute(query, [lookup_code])
            else:
                # Fallback para otros reportes - simplemente ejecutamos la consulta tal cual
                cursor.execute(report.query)
            
            # Obtener nombres de columnas
            columns = [column[0] for column in cursor.description]
            
            # Convertir resultados a lista de diccionarios
            results = []
            for row in cursor.fetchall():
                # Convertir valores de fecha a string para serialización JSON
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'isoformat'):  # Si es una fecha/hora
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                results.append(row_dict)
            
            cursor.close()
            conn.close()
            
            # Añadimos info del proyecto para el frontend
            return Response({
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'lookup_code': project.lookup_code
                },
                'results': results
            })
        except Exception as e:
            # Mejorar el manejo de errores para poder depurar
            import traceback
            error_details = {
                'message': str(e),
                'traceback': traceback.format_exc()
            }
            return Response({'error': error_details}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def execute_custom_query(self, request):
        """
        Ejecuta una consulta personalizada enviada en el body de la petición
        """
        query = request.data.get('query')
        if not query:
            return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            conn = self.get_sql_connection()
            cursor = conn.cursor()
            cursor.execute(query)
            
            # Obtener nombres de columnas
            columns = [column[0] for column in cursor.description]
            
            # Convertir resultados a lista de diccionarios
            results = []
            for row in cursor.fetchall():
                # Convertir valores de fecha a string para serialización JSON
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'isoformat'):  # Si es una fecha/hora
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                results.append(row_dict)
            
            cursor.close()
            conn.close()
            
            return Response({'results': results})
        except Exception as e:
            import traceback
            error_details = {
                'message': str(e),
                'traceback': traceback.format_exc()
            }
            return Response({'error': error_details}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)