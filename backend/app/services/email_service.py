"""
Email service to send transactional emails and trigger Trustpilot AFS.
"""
import os
import logging
import smtplib
from email.message import EmailMessage
from typing import Optional

logger = logging.getLogger(__name__)

# Trustpilot AFS Email
TRUSTPILOT_AFS_BCC = "rewriteguard.com+f575b5dd9c@invite.trustpilot.com"

# Set to False in production environment
MOCK_EMAIL_DELIVERY = os.getenv("MOCK_EMAIL_DELIVERY", "true").lower() == "true"

# SMTP Settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
GMAIL_USER = os.getenv("GMAIL_USER", "emailrewriteguard@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")

async def send_contact_request_email(
    name: str, 
    email: str, 
    category: str, 
    sub_category: str, 
    subject: str, 
    description: str,
    attachment_content: Optional[bytes] = None,
    attachment_filename: Optional[str] = None
) -> bool:
    """
    Sends a contact/support request email to rewriteguard@gmail.com.
    """
    target_email = "rewriteguard@gmail.com"
    category_display = f"{category} ({sub_category})" if sub_category else category
    email_subject = f"Contact Form: {category_display} - {subject}"
    
    body = f"""New Support Request:

Name: {name}
Email: {email}
Category: {category}
{f"Sub-Category: {sub_category}" if sub_category else ""}
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
    msg["From"] = f"RewriteGuard Support <{GMAIL_USER}>"
    msg["To"] = target_email
    msg["Reply-To"] = email  # So you can reply directly to the user
    
    if attachment_content and attachment_filename:
        # Simple detection of maintype/subtype from filename
        maintype, subtype = "application", "octet-stream"
        if attachment_filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            maintype, subtype = "image", attachment_filename.split('.')[-1]
        
        msg.add_attachment(
            attachment_content,
            maintype=maintype,
            subtype=subtype,
            filename=attachment_filename
        )
    
    if MOCK_EMAIL_DELIVERY:
        logger.info("\n=== MOCK SUPPORT EMAIL DELIVERY ===")
        logger.info(f"To: {target_email}")
        logger.info(f"From: {email} (User)")
        logger.info(f"Subject: {email_subject}")
        logger.info(f"Has Attachment: {attachment_filename if attachment_filename else 'No'}")
        logger.info(f"Body:\n{body}")
        logger.info("========================================\n")
        return True
    
    try:
        if not GMAIL_APP_PASSWORD:
            logger.error("GMAIL_APP_PASSWORD not set. Cannot send real email.")
            return False
            
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send support email: {e}")
        return False
    
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

async def send_auto_reply_confirmation(user_email: str, user_name: str, subject: str) -> bool:
    """
    Sends an automatic confirmation email to the user who submitted the support form.
    """
    email_subject = f"We've received your request: {subject}"
    body = f"""Hi {user_name},

Thank you for reaching out to RewriteGuard support!

We have received your request regarding "{subject}". Our team is currently reviewing the details, and we will get back to you at this email address as soon as possible.

If you have additional information to add, simply reply to this email.

Best regards,
The RewriteGuard Team
https://www.rewriteguard.com
"""

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = email_subject
    msg["From"] = f"RewriteGuard Support <{GMAIL_USER}>"
    msg["To"] = user_email

    if MOCK_EMAIL_DELIVERY:
        logger.info("\n=== MOCK AUTO-REPLY DELIVERY ===")
        logger.info(f"To: {user_email}")
        logger.info(f"Subject: {email_subject}")
        logger.info(f"Body:\n{body}")
        logger.info("==================================\n")
        return True

    try:
        if not GMAIL_APP_PASSWORD:
            logger.error("GMAIL_APP_PASSWORD not set. Cannot send auto-reply.")
            return False
            
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send auto-reply email: {e}")
        return False
