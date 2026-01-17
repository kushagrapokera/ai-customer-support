// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\tools\billingTools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const getInvoiceDetailsTool = tool({
  description: 'Retrieve invoice details including amount, status, and due date',
  parameters: z.object({
    invoiceNumber: z.string().describe('The invoice number like INV-2026-001'),
  }),
  execute: async ({ invoiceNumber }) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { invoiceNumber },
      })
      
      if (!invoice) {
        return {
          success: false,
          error: `Invoice ${invoiceNumber} not found`
        }
      }
      
      return {
        success: true,
        data: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          tax: invoice.tax,
          totalAmount: invoice.totalAmount,
          issuedDate: invoice.issuedDate,
          dueDate: invoice.dueDate
        }
      }
    } catch (error) {
      console.error('Invoice lookup error:', error)
      return {
        success: false,
        error: 'Failed to retrieve invoice details'
      }
    }
  },
})

export const checkRefundStatusTool = tool({
  description: 'Check refund status for a payment or transaction',
  parameters: z.object({
    transactionId: z.string().describe('The transaction ID like TXN-ORD-2026-001'),
  }),
  execute: async ({ transactionId }) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { transactionId },
      })
      
      if (!payment) {
        return {
          success: false,
          error: `Transaction ${transactionId} not found`
        }
      }
      
      return {
        success: true,
        data: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          refundStatus: payment.refundStatus,
          refundAmount: payment.refundAmount,
          paymentMethod: payment.paymentMethod
        }
      }
    } catch (error) {
      console.error('Refund status error:', error)
      return {
        success: false,
        error: 'Failed to check refund status'
      }
    }
  },
})

export const billingTools = {
  getInvoiceDetails: getInvoiceDetailsTool,
  checkRefundStatus: checkRefundStatusTool,
}
