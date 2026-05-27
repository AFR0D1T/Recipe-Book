from rest_framework import viewsets, permissions, response, status
from rest_framework.decorators import action
from recipes import models, serializers
from accounts.permissions import IsAuthorOrReadOnly


class RecipesViewSet(viewsets.ModelViewSet):
    queryset = models.Recipe.objects.all().order_by('-created_at')
    serializer_class = serializers.RecipesListSerializers
    lookup_url_kwarg = 'id'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'partial_update', 'update']:
            return serializers.RecipesCreateSerializers

        if self.action == 'retrieve':
            return serializers.RecipesDetailSerializers

        return self.serializer_class

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, id=None):
        recipe = models.Recipe.objects.get(id=id)
        comments = recipe.comments.all().order_by('-created_at')

        if request.method == 'POST':
            comments_serializers = serializers.CommentsCreateSerializer(data=request.data)
            comments_serializers.is_valid(raise_exception=True)
            comments_serializers.save(
                author=request.user,
                recipe=recipe,)

            return response.Response(status=status.HTTP_201_CREATED)

        comments_serializers = serializers.CommentsNestedSerializer(comments, many=True)
        return response.Response(comments_serializers.data)
