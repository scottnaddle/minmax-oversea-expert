import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
})

// Certificate price (KRW)
const CERTIFICATE_PRICES = {
  career: 55000,        // 경력 증명서
  oda_experience: 77000, // ODA 경력 증명서
  project: 44000,       // 프로젝트 증명서
  education: 33000,    // 학력 증명서
}

const PRICE_LABELS = {
  career: '경력 증명서 발급',
  oda_experience: 'ODA 경력 증명서 발급',
  project: '프로젝트 증명서 발급',
  education: '학력 증명서 발급',
}

// POST /api/payments/create-intent - Create Stripe Payment Intent
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { certificateType, certificateRequestId } = await request.json()

    if (!certificateType || !PRICE_LABELS[certificateType as keyof typeof PRICE_LABELS]) {
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 })
    }

    const amount = CERTIFICATE_PRICES[certificateType as keyof typeof CERTIFICATE_PRICES]

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'krw',
      metadata: {
        userId: user.id,
        userEmail: user.email,
        certificateType,
        certificateRequestId: certificateRequestId || '',
      },
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'krw',
        status: 'pending',
        stripePaymentId: paymentIntent.id,
        description: PRICE_LABELS[certificateType as keyof typeof PRICE_LABELS],
        metadata: JSON.stringify({ certificateType }),
      },
    })

    // Update certificate request if provided
    if (certificateRequestId) {
      await prisma.certificateRequest.update({
        where: { id: certificateRequestId },
        data: { paymentId: payment.id },
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Payment processing error' }, { status: 500 })
  }
}

// GET /api/payments - Get user's payment history
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        certificateRequest: {
          select: { id: true, type: true, title: true, status: true },
        },
      },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}