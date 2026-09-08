from rest_framework import viewsets

from .models import (
    Category,
    Product,
    ProductOption,
    Ingredient,
)

from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductOptionSerializer,
    IngredientSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(
        is_active=True
    ).prefetch_related("products__options")
    
    serializer_class = CategorySerializer
    
    
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(
        is_available=True
    ).prefetch_related("options")
    
    serializer_class = ProductSerializer
    
    
class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    
    serializer_class = IngredientSerializer