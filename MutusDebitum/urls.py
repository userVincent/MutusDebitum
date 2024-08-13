
from django.contrib import admin
from django.urls import path, include
from django.urls import re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
