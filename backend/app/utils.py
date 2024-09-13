#Utility functions for QR code and report generation
import qrcode
import os
import pandas as pd
from flask import url_for, current_app as app
from .models import get_db_connection
import MySQLdb

def generate_qr_code(meeting_id):
    # url = url_for('main.get_meeting', meeting_id=meeting_id, _external=True)
    url = "http://localhost:5173/meeting/"+str(meeting_id)  #for testing purposes
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    qr_path = os.path.join(app.root_path, f'static/meeting_{meeting_id}_qr.png')
    img.save(qr_path)
    return qr_path

def generate_excel_report(meeting_id):
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT first_name, last_name, email, phone, department FROM attendees WHERE meeting_id = %s", (meeting_id,))
    attendees = cursor.fetchall()
    cursor.close()
    connection.close()

    df = pd.DataFrame(attendees)
    excel_path = os.path.join(app.root_path, f'static/meeting_{meeting_id}_report.xlsx')
    df.to_excel(excel_path, index=False)
    return excel_path
