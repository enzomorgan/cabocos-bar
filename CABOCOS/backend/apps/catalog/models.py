from django.db import models

class Category(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
    )
    
    display_order = models.PositiveIntegerField(
        default=0,
    )
    
    is_active = models.BooleanField(
        default=True,
    )
    
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "categoria"
        verbose_name_plural = "categorias"
        
    def __str__(self):
        return self.name
    
    
class Product(models.Model):
    class ProductType(models.TextChoices):
        NORMAL = "NORMAL", "Normal",
        PIZZA = "PIZZA", "Pizza",
        PASTEL = "PASTEL", "Pastel",
        DRINK = "DRINK", "Bebida"
    
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )
    
    name = models.CharField(max_length=255)
    
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    
    description = models.TextField(blank=True)
    
    ingredients = models.TextField(blank=True)
    
    image = models.URLField(blank=True)
    
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.NORMAL,
    )
    
    featured = models.BooleanField(default=False)
    
    is_available = models.BooleanField(default=True)
    
    display_order = models.PositiveIntegerField(default=0)
    
    create_at = models.DateTimeField(auto_now_add=True)
    
    update_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "produto"
        verbose_name_plural = "produtos"
        
    def __str__(self):
        return self.name
    

class ProductOption(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="options",
    )
    
    label = models.CharField(max_length=255)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    display_order = models.PositiveIntegerField(default=0)
    
    is_default = models.BooleanField(default=False)
    
    class Meta:
        ordering = ["display_order", "price"]
        verbose_name = "opção de produto"
        verbose_name_plural = "opções de produto"
        
    def __str__(self):
        return f"{self.product.name} - {self.label}"
    
    
class Ingredient(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    available = models.BooleanField(default=True)
    
    create_at = models.DateTimeField(auto_now_add=True)
    
    update_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]
        verbose_name = "ingrediente"
        verbose_name_plural = "ingredientes"
    
    def __str__(self):
        return self.name