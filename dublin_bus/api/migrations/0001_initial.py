# Generated by Django 3.2.5 on 2022-07-19 12:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('route_short_name', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'routes',
            },
        ),
        migrations.CreateModel(
            name='Stop',
            fields=[
                ('id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('stop_name', models.CharField(max_length=200)),
                ('stop_lat', models.FloatField(max_length=100)),
                ('stop_lon', models.FloatField(max_length=100)),
                ('favourited_by', models.ManyToManyField(blank=True, related_name='favourited_stops', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'stops',
            },
        ),
        migrations.CreateModel(
            name='StopTimesRoutes',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('trip_id', models.CharField(max_length=50)),
                ('arrival_time', models.CharField(max_length=50)),
                ('stop_id', models.CharField(max_length=100)),
                ('stop_sequence', models.IntegerField()),
                ('stop_headsign', models.CharField(max_length=50)),
                ('shape_dist_traveled', models.CharField(max_length=50)),
                ('route_id', models.CharField(max_length=50)),
                ('route_short_name', models.CharField(max_length=50)),
                ('direction_id', models.IntegerField()),
            ],
            options={
                'db_table': 'stoptimes_routes',
            },
        ),
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('trip_id', models.CharField(default=0, max_length=255)),
                ('headsign', models.CharField(default=0, max_length=50)),
                ('direction', models.PositiveIntegerField(default=0)),
                ('route_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.route')),
            ],
            options={
                'db_table': 'trips',
            },
        ),
        migrations.CreateModel(
            name='TripsStops',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('progress_num', models.PositiveIntegerField(default=0)),
                ('stop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.stop')),
                ('trip', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.trip')),
            ],
            options={
                'db_table': 'trips_stops',
            },
        ),
        migrations.CreateModel(
            name='StopTimes',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('trip_id', models.CharField(max_length=50)),
                ('arrival_time', models.TimeField()),
                ('progress_num', models.PositiveIntegerField(default=0)),
                ('stop_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.stop')),
            ],
            options={
                'db_table': 'stop_times',
            },
        ),
        migrations.CreateModel(
            name='RouteSign',
            fields=[
                ('id', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('route_id', models.CharField(max_length=50)),
                ('route_short_name', models.CharField(max_length=50)),
                ('headsign', models.CharField(max_length=100)),
                ('favourited_by', models.ManyToManyField(blank=True, related_name='favourited_routes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'routes_sign',
            },
        ),
    ]
