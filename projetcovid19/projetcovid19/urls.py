from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('dynmap/', include('dynmap.urls')),
    path('admin/', admin.site.urls),
]
