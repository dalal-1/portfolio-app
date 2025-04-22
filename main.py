from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Change to a secure secret key
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Example: using Gmail for email sending
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'your_email_password'  # Replace with your email password

# Initialize mail
mail = Mail(app)

# Initialize URLSafeTimedSerializer for token creation and validation
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Fake database for demonstration purposes
users_db = {}  # This would typically be a database in a real application

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Check if the email already exists
        if email in users_db:
            flash("Email already exists.", "error")
            return redirect(url_for('register'))

        # Store the user (hashed password)
        users_db[email] = {'password': generate_password_hash(password), 'confirmed': False}
        token = serializer.dumps(email, salt='email-confirm')

        confirm_url = url_for('confirm_email', token=token, _external=True)

        # Send confirmation email
        subject = "Please confirm your email"
        msg = Message(subject, sender='your_email@gmail.com', recipients=[email])
        msg.body = f"Click the link to confirm your email: {confirm_url}"

        try:
            mail.send(msg)
            flash("Confirmation email sent!", "info")
        except Exception as e:
            flash(f"Error sending email: {str(e)}", "error")
            return redirect(url_for('register'))

        return render_template('confirmed.html', email=email)
    
    return render_template('register.html')

@app.route('/confirm/<token>')
def confirm_email(token):
    try:
        email = serializer.loads(token, salt='email-confirm', max_age=3600)  # Link expires in 1 hour
        if email in users_db:
            users_db[email]['confirmed'] = True
            flash(f"Email {email} confirmed successfully!", "success")
            return redirect(url_for('index'))
        else:
            flash("Invalid or expired confirmation link.", "error")
            return redirect(url_for('index'))
    except Exception as e:
        flash("The confirmation link is invalid or has expired.", "error")
        return redirect(url_for('index'))

@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'POST':
        email = request.form.get('email')

        if email not in users_db:
            flash("Email not found.", "error")
            return redirect(url_for('reset_password'))

        # Create a reset token
        token = serializer.dumps(email, salt='reset-password')
        reset_url = url_for('reset_with_token', token=token, _external=True)

        subject = "Password Reset"
        msg = Message(subject, sender='your_email@gmail.com', recipients=[email])
        msg.body = f"Click the link to reset your password: {reset_url}"

        try:
            mail.send(msg)
            flash("Password reset email sent!", "info")
        except Exception as e:
            flash(f"Error sending email: {str(e)}", "error")
            return redirect(url_for('reset_password'))

        return render_template('reset.html', email=email)
    
    return render_template('reset.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_with_token(token):
    try:
        email = serializer.loads(token, salt='reset-password', max_age=3600)  # Link expires in 1 hour
        if request.method == 'POST':
            new_password = request.form.get('password')
            users_db[email]['password'] = generate_password_hash(new_password)
            flash("Password successfully updated!", "success")
            return redirect(url_for('index'))
        return render_template('reset_with_token.html', email=email)

    except Exception as e:
        flash("The reset link is invalid or has expired.", "error")
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
