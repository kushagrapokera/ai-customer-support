// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\tools\orderTools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const getOrderDetailsTool = tool({
  description: 'Fetch complete order details including items, status, and tracking information by order number',
  parameters: z.object({
    orderNumber: z.string().describe('The order number like ORD-2026-001'),
  }),
  execute: async ({ orderNumber }) => {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
      })
      
      if (!order) {
        return { 
          success: false,
          error: `Order ${orderNumber} not found` 
        }
      }
      
      return {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          items: JSON.parse(order.items),
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt
        }
      }
    } catch (error) {
      console.error('Order lookup error:', error)
      return {
        success: false,
        error: 'Failed to retrieve order details'
      }
    }
  },
})

export const checkDeliveryStatusTool = tool({
  description: 'Check the current delivery status and tracking information for an order',
  parameters: z.object({
    orderNumber: z.string().describe('The order number to track'),
  }),
  execute: async ({ orderNumber }) => {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          orderNumber: true,
          status: true,
          trackingNumber: true,
          estimatedDelivery: true
        }
      })
      
      if (!order) {
        return {
          success: false,
          error: `Order ${orderNumber} not found`
        }
      }
      
      return {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          status: order.status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery
        }
      }
    } catch (error) {
      console.error('Delivery status error:', error)
      return {
        success: false,
        error: 'Failed to check delivery status'
      }
    }
  },
})

export const orderTools = {
  getOrderDetails: getOrderDetailsTool,
  checkDeliveryStatus: checkDeliveryStatusTool,
}
