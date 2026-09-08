from django.contrib.auth.models import AbstractUser
from django.db import models

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    MANAGER = 'MANAGER', 'Gerente'
    ATTENDANT = 'ATTENDANT', 'Atendente'
    KITCHEN = 'KITCHEN', 'Cozinha'
    DELIVERY = 'DELIVERY', 'Entregador'
    
class User(AbstractUser):
    first_name = None
    last_name = None
    
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.ATTENDANT,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    def __str__(self):
        return self.name