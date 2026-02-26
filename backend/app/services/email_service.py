"""
Email service to send transactional emails and trigger Trustpilot AFS.
"""
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

# Trustpilot AFS Email
TRUSTPILOT_AFS_BCC = "rewriteguard.com+f575b5dd9c@invite.trustpilot.com"

# Set to False when real SMTP credentials are provided in the future
MOCK_EMAIL_DELIVERY = True

async def send_contact_request_email(name: str, email: str, category: str, subject: str, description: str) -> bool:
    """
    Sends a contact/support request email to rewriteguard@gmail.com.
    """
    target_email = "rewriteguard@gmail.com"
    email_subject = f"Contact Form: {category} - {subject}"
    body = f"""New Support Request:

Name: {name}
Email: {email}
Category: {category}
Subject: {subject}

Description:
{description}

---
Best,
The RewriteGuard System
"""
    
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = email_subject
    msg["From"] = "support@rewriteguard.com"
    msg["To"] = target_email
    
    if MOCK_EMAIL_DELIVERY:
        logger.info("\n=== MOCK SUPPORT EMAIL DELIVERY ===")
        logger.info(f"To: {target_email}")
        logger.info(f"From: {email} (User)")
        logger.info(f"Subject: {email_subject}")
        logger.info(f"Body:\n{body}")
        logger.info("========================================\n")
        return True
    
    # In production, use smtplib or a service provider
    return True

async def send_subscription_receipt_email(user_email: str, subscription_id: str, plan_name: str) -> bool:
    """
    Sends a subscription receipt email to the user, and BCCs Trustpilot AFS
    so that Trustpilot can trigger a review invitation.
    """
    subject = f"Your RewriteGuard {plan_name} Subscription Receipt"
    body = f"""Hi there,

Thank you for subscribing to the RewriteGuard {plan_name} plan!
Your subscription ID is: {subscription_id}.

We hope you enjoy using our service. If you have any issues, please contact our support team.

Best,
The RewriteGuard Team
"""
    
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = "support@rewriteguard.com"
    msg["To"] = user_email
    msg["Bcc"] = TRUSTPILOT_AFS_BCC
    
    if MOCK_EMAIL_DELIVERY:
        logger.info("\n=== MOCK EMAIL DELIVERY (Local Test) ===")
        logger.info(f"To: {user_email}")
        logger.info(f"Bcc: {TRUSTPILOT_AFS_BCC} (Trustpilot AFS trigger)")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body:\n{body}")
        logger.info("========================================\n")
        return True
    
    # In production, use smtplib with SMTP credentials to send the email
    # server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
    # server.starttls()
    # server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    # server.send_message(msg)
    # server.quit()
    return True
