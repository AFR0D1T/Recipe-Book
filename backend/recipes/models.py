from django.contrib.auth import get_user_model
from django.db import models

class Recipe(models.Model):
    name = models.CharField(max_length=200, verbose_name='Name')
    description = models.TextField(max_length=2000, verbose_name='Description')
    ingredients = models.TextField(max_length=2000, verbose_name='Ingredients')
    cooking_time = models.PositiveIntegerField(verbose_name='Cooking time')
    image = models.ImageField(upload_to='image', verbose_name='Image')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created at')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,
                               verbose_name='Author', related_name='recipes')


class Comment(models.Model):
    text = models.TextField(max_length=2000, verbose_name='Text')
    recipe = models.ForeignKey('recipes.Recipe', on_delete=models.CASCADE,
                               verbose_name='Recipe', related_name='comments')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,
                               verbose_name='Author', related_name='comments')
    created_at = models.DateField(auto_now_add=True, verbose_name='Created at')
