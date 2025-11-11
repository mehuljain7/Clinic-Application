# Use a small Python base
FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Install OS deps (if pandas needs build tools) - kept minimal
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code (including CSVs)
COPY . .

# Expose port
EXPOSE 3000

# Use gunicorn for production. --workers can be tuned
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "app:app"]
