# serializers.py
from rest_framework import serializers
from .models import ReportDefinition

class ReportDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDefinition
        fields = ['id', 'name', 'description', 'category', 'file_path', 
                 'requires_project_filter', 'created_at', 'updated_at']