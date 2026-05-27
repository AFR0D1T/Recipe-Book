from rest_framework import generics
from accounts import serializers

# Create your views here.
class Register(generics.CreateAPIView):
    serializer_class = serializers.UserSerializer
    