from django.db import models
from django.contrib.auth import get_user_model
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['updated_at']


    def __str__(self):
        return self.name


class Post(models.Model):
    category = models.ForeignKey(to=Category, on_delete=models.CASCADE)
    author = models.ForeignKey(
        to=get_user_model(), on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField()
    published_at = models.DateTimeField(auto_now_add=True)
    raw_image = models.ImageField(
        upload_to='upload/', null=True, blank=True)
    image = ImageSpecField(source='raw_image',
                           processors=[ResizeToFill(640, 480)],
                           format='JPEG',
                           )
    prefecture = models.CharField(max_length=10, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    lat = models.DecimalField(
        max_digits=20,
        decimal_places=15,
        null=True,
        blank=True)
    lng = models.DecimalField(
        max_digits=20,
        decimal_places=15,
        null=True,
        blank=True)
    likes_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(
        to=Post,
        verbose_name='対象記事',
        on_delete=models.CASCADE,
        related_name='comment_post')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.author} -  {self.text}'


class Like(models.Model):
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='like_user')
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='like_post')

class Connection(models.Model):
    follower = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='follower')
    following = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="following")

    def __str__(self):
        return "{} : {}".format(self.follower.username, self.following.username)
