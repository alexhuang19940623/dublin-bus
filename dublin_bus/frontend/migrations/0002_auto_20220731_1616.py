# Generated by Django 3.2.5 on 2022-07-31 08:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='content',
            name='creat_time',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='content',
            name='reply_time',
            field=models.TextField(default=''),
        ),
    ]
