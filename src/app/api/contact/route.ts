import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Contact form submission will be logged only.');
      console.log('Contact form submission (email not sent):', {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Thank you for your message! We have received your inquiry. (Note: Email delivery is not configured)' 
        },
        { status: 200 }
      );
    }

    // Send email to Technical Secretary
    try {
      const emailResult = await resend.emails.send({
        from: 'contact@iitgn.tech', // This should be your verified domain
        to: ['technical.secretary@iitgn.ac.in'],
        subject: `Contact Form: ${body.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong style="color: #374151;">Name:</strong> ${body.name}</p>
              <p><strong style="color: #374151;">Email:</strong> 
                <a href="mailto:${body.email}" style="color: #2563eb;">${body.email}</a>
              </p>
              <p><strong style="color: #374151;">Subject:</strong> ${body.subject}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px;">
                ${body.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p>This message was sent from the Technical Council website contact form.</p>
              <p>Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        `,
      });

      console.log('Contact form email sent successfully:', emailResult);

      // Optional: Send confirmation email to user
      await resend.emails.send({
        from: 'contact@iitgn.tech',
        to: [body.email],
        subject: 'Thank you for contacting Technical Council - IIT Gandhinagar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for reaching out!</h2>
            
            <p>Dear ${body.name},</p>
            
            <p>We have received your message regarding "<strong>${body.subject}</strong>" and appreciate you taking the time to contact us.</p>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>What happens next?</strong></p>
              <p style="margin: 10px 0 0 0;">Our team will review your inquiry and respond within 1-2 business days. For urgent matters, you can also reach us directly at technical.secretary@iitgn.ac.in</p>
            </div>
            
            <p>Best regards,<br>
            <strong>Technical Council</strong><br>
            IIT Gandhinagar</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
          </div>
        `,
      });

    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      
      // Log the submission even if email fails
      console.log('Contact form submission (email failed):', {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        timestamp: new Date().toISOString(),
        emailError: emailError instanceof Error ? emailError.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Thank you for your message! We have received your inquiry and will get back to you soon.' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We have received your inquiry and will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
