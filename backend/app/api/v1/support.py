from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.services.email_service import send_contact_request_email

router = APIRouter()

@router.post("/submit")
async def submit_contact_form(
    name: str = Form("Anonymous"),
    email: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(""),
    subject: str = Form(...),
    description: str = Form(...),
    attachment: Optional[UploadFile] = File(None)
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
        attachment_filename=filename
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send support request.")
    
    return {"status": "success", "message": "Support request submitted successfully."}
