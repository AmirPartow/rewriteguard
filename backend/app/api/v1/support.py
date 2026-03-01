from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Optional
from app.services.email_service import (
    send_contact_request_email,
    send_auto_reply_confirmation,
)

router = APIRouter()


@router.post("/submit")
async def submit_contact_form(
    background_tasks: BackgroundTasks,
    name: str = Form("Anonymous"),
    email: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(""),
    subject: str = Form(...),
    description: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
):
    """
    Submits a contact form with an optional attachment and sends it to the support email.
    """
    # Read attachment content if provided
    file_content = None
    filename = None
    if attachment:
        file_content = await attachment.read()
        filename = attachment.filename

    success = await send_contact_request_email(
        name=name,
        email=email,
        category=category,
        sub_category=sub_category,
        subject=subject,
        description=description,
        attachment_content=file_content,
        attachment_filename=filename,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send support request.")

    # Send auto-reply in background so the user doesn't wait
    background_tasks.add_task(send_auto_reply_confirmation, email, name, subject)

    return {"status": "success", "message": "Support request submitted successfully."}
