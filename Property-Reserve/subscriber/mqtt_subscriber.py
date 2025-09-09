import paho.mqtt.client as mqtt
import json
from datetime import datetime
# from dotenv import load_dotenv
# descomentar en local
import os
import requests

# necesario sin docker compose env_file
# load_dotenv(dotenv_path=".env")
# load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

HOST = os.getenv("BROKER_HOST")
PORT = int(os.getenv("BROKER_PORT"))
USER = os.getenv("BROKER_USER")
PASSWORD = os.getenv("BROKER_PASSWORD")
URL = os.getenv("API_URL")


def on_connect(client, userdata, flags, code):
    print("Conexión al broker")
    print(f"Hora de conexión a las {datetime.now()}")
    client.subscribe("properties/info")


def on_message(client, userdata, msg):
    print(f"Llega mensaje a las {datetime.now()}")

    try:
        payload = msg.payload.decode("utf-8")
        property_data = json.loads(payload)
        print("Nueva propiedad:")
        print(json.dumps(property_data, indent=2))

        response = requests.post(URL, json=property_data)

        if response.status_code == 200:
            print("Propiedad enviada correctamente")

        else:
            print(f"Error al enviar propiedad: {response.status_code} - {response.text}")

        print(f"Respuesta API: {response.text}")

    except json.JSONDecodeError as e:
        print(f"Error decodificando json: {e}")

    except Exception as e:
        print("Error no identificado: ", e)


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message


client.username_pw_set(USER, PASSWORD)
client.connect(HOST, PORT)

client.loop_forever()
