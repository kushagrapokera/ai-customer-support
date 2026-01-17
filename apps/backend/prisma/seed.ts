import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'ORD-2026-001',
        status: 'delivered',
        totalAmount: 1299.99,
        items: JSON.stringify([
          { name: 'Laptop Stand', quantity: 1, price: 1299.99 }
        ]),
        shippingAddress: '123 Main St, Chennai, Tamil Nadu 600001',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date('2026-01-20'),
      },
    }),
    prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'ORD-2026-002',
        status: 'shipped',
        totalAmount: 899.50,
        items: JSON.stringify([
          { name: 'Wireless Mouse', quantity: 2, price: 449.75 }
        ]),
        shippingAddress: '123 Main St, Chennai, Tamil Nadu 600001',
        trackingNumber: 'TRK987654321',
        estimatedDelivery: new Date('2026-01-18'),
      },
    }),
    prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'ORD-2026-003',
        status: 'processing',
        totalAmount: 2499.00,
        items: JSON.stringify([
          { name: 'Mechanical Keyboard', quantity: 1, price: 2499.00 }
        ]),
        shippingAddress: '123 Main St, Chennai, Tamil Nadu 600001',
        estimatedDelivery: new Date('2026-01-22'),
      },
    }),
  ])

  console.log(`✅ Created ${orders.length} orders`)

  // Create payments for orders
  for (const order of orders) {
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'credit_card',
        amount: order.totalAmount,
        status: order.status === 'delivered' ? 'completed' : 'pending',
        transactionId: `TXN-${order.orderNumber}`,
      },
    })

    // Create invoice
    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        invoiceNumber: `INV-${order.orderNumber}`,
        amount: order.totalAmount,
        tax: order.totalAmount * 0.18,
        totalAmount: order.totalAmount * 1.18,
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Created payments and invoices')

  // Create FAQs
  const faqs = await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot Password". Enter your email and follow the instructions sent to your inbox.',
        category: 'account',
        keywords: ['password', 'reset', 'forgot', 'login'],
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days. Express shipping takes 1-2 business days.',
        category: 'general',
        keywords: ['shipping', 'delivery', 'time', 'duration'],
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'How do I track my order?',
        answer: 'You can track your order using the tracking number sent to your email. Click the tracking link or enter the number on our tracking page.',
        category: 'general',
        keywords: ['track', 'order', 'tracking', 'status'],
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is your refund policy?',
        answer: 'We offer full refunds within 30 days of purchase for unused items in original packaging. Refunds are processed within 5-7 business days.',
        category: 'billing',
        keywords: ['refund', 'return', 'money', 'back'],
      },
    }),
  ])

  console.log(`✅ Created ${faqs.length} FAQs`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
