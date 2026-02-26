from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.email_service import send_contact_request_email

router = APIRouter()

class ContactRequest(BaseModel):
    name: str = "Anonymous"
    email: EmailStr
    category: str
    subject: str
    description: str

@router.post("/submit")
async def submit_contact_form(request: ContactRequest):
    """
    Submits a contact form and sends it to the support email.
    """
    success = await send_contact_request_email(
        name=request.name,
        email=request.email,
        category=request.category,
        subject=request.subject,
        description=request.description
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send support request.")
    
    return {"status": "success", "message": "Support request submitted successfully."}
