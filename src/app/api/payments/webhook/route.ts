import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

// POST /api/payments/webhook - Stripe Webhook Handler
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status
        await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'completed' },
        })

        // Update certificate request status
        const metadata = paymentIntent.metadata
        if (metadata.certificateRequestId) {
          await prisma.certificateRequest.update({
            where: { id: metadata.certificateRequestId },
            data: { status: 'paid' },
          })

          // Notify user
          const certificateRequest = await prisma.certificateRequest.findUnique({
            where: { id: metadata.certificateRequestId },
            include: { user: true },
          })

          if (certificateRequest) {
            await prisma.notification.create({
              data: {
                userId: certificateRequest.userId,
                type: 'payment',
                title: '결제 완료',
                content: `증명서 발급 결제가 완료되었습니다. 관리자의 승인을 기다립니다.`,
                data: JSON.stringify({ 
                  certificateRequestId: metadata.certificateRequestId,
                  paymentId: paymentIntent.id,
                }),
              },
            })
          }
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'failed' },
        })

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        
        if (charge.payment_intent) {
          const paymentIntentId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent.id

          await prisma.payment.update({
            where: { stripePaymentId: paymentIntentId },
            data: { status: 'refunded' },
          })
        }

        console.log('Payment refunded:', charge.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}