# reports/report_manager.py
import os
from django.conf import settings

class SQLReportManager:
    def __init__(self):
        # Directorio base para los archivos SQL
        self.sql_base_dir = os.path.join(settings.BASE_DIR, 'reports', 'sql')
    
    def get_sql_path(self, category, file_path):
        """Obtiene la ruta completa al archivo SQL"""
        return os.path.join(self.sql_base_dir, category, file_path)
    
    def load_sql(self, category, file_path):
        """Carga el contenido SQL desde un archivo"""
        full_path = self.get_sql_path(category, file_path)
        try:
            with open(full_path, 'r') as sql_file:
                return sql_file.read()
        except FileNotFoundError:
            raise ValueError(f"SQL file not found: {full_path}")
    
    def execute_sql_report(self, connection, category, file_path, params=None):
        """Ejecuta un reporte SQL desde un archivo con parámetros opcionales"""
        sql = self.load_sql(category, file_path)
        cursor = connection.cursor()
        
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        
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
        return columns, results