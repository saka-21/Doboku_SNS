# Generated by Django 3.0.3 on 2020-06-17 13:49

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sns', '0003_post_good'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='good',
        ),
        migrations.AddField(
            model_name='post',
            name='like',
            field=models.ManyToManyField(blank=True, related_name='like', to=settings.AUTH_USER_MODEL),
        ),
    ]
