from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductViewSet,
    IngredientViewSet,
)

router = DefaultRouter()

router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("ingredients", IngredientViewSet)

urlpatterns = router.urls