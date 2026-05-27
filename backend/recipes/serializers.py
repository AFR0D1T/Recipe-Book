from django.contrib.auth import get_user_model
from rest_framework import serializers
from recipes.models import Recipe, Comment

class RecipesListSerializers(serializers.ModelSerializer):
    author= serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'author', 'cooking_time', 'created_at', 'image']


class RecipesDetailSerializers(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'description', 'ingredients', 'cooking_time', 'image', 'created_at', 'author']


class RecipesCreateSerializers(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['name', 'description', 'ingredients', 'cooking_time', 'image']


class CommentsNestedSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['text', 'recipe', 'author', 'created_at']


class CommentsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text']
