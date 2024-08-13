from django.urls import path
from .views import OptimalLivingAPIView

urlpatterns = [
    path('optimal-living/', OptimalLivingAPIView.as_view(), name='optimal_living'),
]
