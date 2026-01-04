import { NextResponse } from 'next/server';
import { sendVerificationCode } from '../../../lib/email/send';

// Diagnostic endpoint to test email sending
// This endpoint should be removed or secured in production
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing email sending to:', email);

    // Generate test code
    const testCode = '123456';

    // Try to send the email
    const result = await sendVerificationCode(email, testCode);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      email: email,
      note: 'This is a test email with verification code: 123456'
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
