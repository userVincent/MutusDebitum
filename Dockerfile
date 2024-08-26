# Use an official Python runtime as a parent image
FROM python:3.11.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project and React build files into the container
COPY . /app/

# Collect static files for Django (including React build files)
RUN python manage.py collectstatic --noinput

# Expose the port that your Django app runs on
EXPOSE 8000

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=MutusDebitum.production
ENV PYTHONUNBUFFERED=1

# Run migrations and start the Django server using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "MutusDebitum.wsgi:application"]
