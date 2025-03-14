# Generated by Django 5.1.6 on 2025-03-03 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('enterprise', '0004_project_users'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='export_format',
            field=models.CharField(choices=[('JSON', 'JSON File'), ('CSV', 'CSV File')], default='JSON', help_text='Export format for orders', max_length=4),
        ),
    ]
