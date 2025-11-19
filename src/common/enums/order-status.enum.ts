/**
 * Order Status Enum
 * Defines the lifecycle status of orders
 * 
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum OrderStatus {
  /**
   * PENDING_PAYMENT - Order created, waiting for payment
   */
  PENDING_PAYMENT = 'PENDING_PAYMENT',

  /**
   * PAID - Payment received and verified
   */
  PAID = 'PAID',

  /**
   * PROCESSING - Order is being prepared
   */
  PROCESSING = 'PROCESSING',

  /**
   * SHIPPED - Order has been shipped
   */
  SHIPPED = 'SHIPPED',

  /**
   * COMPLETED - Order delivered and completed
   */
  COMPLETED = 'COMPLETED',

  /**
   * CANCELLED - Order was cancelled
   */
  CANCELLED = 'CANCELLED',
}

