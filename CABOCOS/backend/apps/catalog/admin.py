from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductOption,
    Ingredient,
)


class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 1
    fields = (
        "label",
        "price",
        "display_order",
        "is_default",
    )
    

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_order",
        "is_active",
    )
    
    list_editable = (
        "display_order",
        "is_active",
    )
    
    search_fields = (
        "name",
    )
    
    ordering = (
        "display_order",
        "name",
    )
    

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "product_type",
        "featured",
        "is_available",
        "display_order",
    )
    
    list_filter = (
        "category",
        "product_type",
        "featured",
        "is_available",
    )
    
    list_editable = (
        "featured",
        "is_available",
        "display_order",
    )
    
    search_fields = (
        "name",
        "description",
        "ingredients",
    )
    
    prepopulated_fields = {
        "slug": ("name",),
    }
    
    ordering = (
        "category",
        "display_order",
        "name",
    )
    
    inlines = [
        ProductOptionInline,
    ]
    
    
@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "available",
    )
    
    list_editable = (
        "available",
    )
    
    search_fields = (
        "name",
    )
    
    ordering = (
        "name",
    )