# models.py
from django.db import models

class ReportDefinition(models.Model):
    """
    Define los reportes disponibles en el sistema
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50)
    file_path = models.CharField(max_length=255, help_text="Ruta relativa al archivo SQL")
    requires_project_filter = models.BooleanField(default=True, help_text="Si el reporte debe filtrarse por proyecto")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name