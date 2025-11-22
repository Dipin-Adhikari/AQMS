# alerts.py
import os
from twilio.rest import Client

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
TWILIO_WHATSAPP_TO = os.getenv("TWILIO_WHATSAPP_TO")

def send_whatsapp_alert(message):
    """Send WhatsApp alert via Twilio. Should use pre-approved message template for production."""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_='whatsapp:' + TWILIO_WHATSAPP_FROM,
            to='whatsapp:' + TWILIO_WHATSAPP_TO
        )
    except Exception as e:
        print("WhatsApp alert failed:", e)
