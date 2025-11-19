/**
 * Shipment Status Enum
 * Defines the status of order shipments
 * 
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum ShipmentStatus {
  /**
   * PENDING - Shipment not yet created
   */
  PENDING = 'PENDING',

  /**
   * PACKED - Order packed and ready to ship
   */
  PACKED = 'PACKED',

  /**
   * SHIPPED - Package handed to courier
   */
  SHIPPED = 'SHIPPED',

  /**
   * IN_TRANSIT - Package in transit
   */
  IN_TRANSIT = 'IN_TRANSIT',

  /**
   * DELIVERED - Package delivered to customer
   */
  DELIVERED = 'DELIVERED',

  /**
   * RETURNED - Package returned to sender
   */
  RETURNED = 'RETURNED',
}

