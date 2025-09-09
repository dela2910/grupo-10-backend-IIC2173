FROM python:3.12-alpine
WORKDIR /subscriber
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "mqtt_subscriber.py"]