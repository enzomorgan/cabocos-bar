from rest_framework import serializers

from .models import Category, Ingredient, Product, ProductOption


class ProductOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOption
        fields = [
            "id",
            "label",
            "price",
            "display_order",
            "is_default",
        ]


class ProductSerializer(serializers.ModelSerializer):
    desc = serializers.CharField(
        source="description",
        read_only=True,
    )

    options = ProductOptionSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "desc",
            "ingredients",
            "image",
            "product_type",
            "featured",
            "is_available",
            "display_order",
            "options",
        ]


class CategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "display_order",
            "is_active",
            "products",
        ]


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "available",
        ]