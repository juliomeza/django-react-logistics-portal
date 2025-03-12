from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Enterprise, Client, Project
from .serializers import EnterpriseSerializer, ClientSerializer, ProjectSerializer

class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Project.objects.none()
        # Devuelve solo los proyectos a los que el usuario pertenece
        return self.request.user.projects.all()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Devuelve el proyecto actual del usuario (primero en la lista si hay varios)
        """
        user_projects = request.user.projects.all()
        if not user_projects.exists():
            return Response({'error': 'User has no associated projects'}, status=403)
        
        project = user_projects.first()
        serializer = self.get_serializer(project)
        return Response(serializer.data)
