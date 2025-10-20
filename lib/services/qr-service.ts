import QRCode from "qrcode"
import { randomBytes } from "crypto"

export class QRService {
  /**
   * Generate a unique QR code string
   */
  static generateQRCodeString(prefix: string = "DEL"): string {
    const timestamp = Date.now().toString(36)
    const random = randomBytes(4).toString("hex")
    return `${prefix}-${timestamp}-${random}`.toUpperCase()
  }

  /**
   * Generate QR code as data URL (base64 image)
   */
  static async generateQRCodeDataURL(data: string): Promise<string> {
    try {
      const qrDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: "M",
        type: "image/png",
        width: 300,
        margin: 2,
      })
      return qrDataURL
    } catch (error) {
      throw new Error("Failed to generate QR code")
    }
  }

  /**
   * Generate QR code as buffer (for saving to file)
   */
  static async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const qrBuffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: "M",
        type: "png",
        width: 300,
        margin: 2,
      })
      return qrBuffer
    } catch (error) {
      throw new Error("Failed to generate QR code buffer")
    }
  }

  /**
   * Generate QR code for delivery confirmation
   */
  static async generateDeliveryQRCode(deliveryId: string): Promise<{
    qrCode: string
    qrCodeDataURL: string
  }> {
    const qrCode = this.generateQRCodeString("DEL")
    const qrCodeDataURL = await this.generateQRCodeDataURL(
      JSON.stringify({
        type: "delivery",
        id: deliveryId,
        code: qrCode,
      })
    )

    return { qrCode, qrCodeDataURL }
  }

  /**
   * Verify QR code data
   */
  static verifyQRCode(scannedData: string): {
    valid: boolean
    type?: string
    id?: string
    code?: string
  } {
    try {
      const data = JSON.parse(scannedData)
      if (data.type && data.id && data.code) {
        return {
          valid: true,
          type: data.type,
          id: data.id,
          code: data.code,
        }
      }
      return { valid: false }
    } catch (error) {
      return { valid: false }
    }
  }
}

