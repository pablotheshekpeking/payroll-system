export class PaystackService {
  constructor() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined')
    }

    this.secretKey = secretKey
    this.baseUrl = 'https://api.paystack.co'
  }

  async initializeTransaction(data) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to initialize transaction')
      }

      return result.data
    } catch (error) {
      throw new Error(`Transaction initialization failed: ${error.message}`)
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify transaction')
      }

      return result.data
    } catch (error) {
      throw new Error(`Transaction verification failed: ${error.message}`)
    }
  }
}

// Create and export a single instance
export const paystack = new PaystackService() 