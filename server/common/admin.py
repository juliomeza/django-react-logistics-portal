from django.contrib import admin
from .models import Status

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'code')
    search_fields = ('name', 'description')