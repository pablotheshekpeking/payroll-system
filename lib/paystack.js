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

  async getBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch balance')
      }

      return result.data
    } catch (error) {
      throw new Error(`Balance retrieval failed: ${error.message}`)
    }
  }

  async createTransferRecipient(data) {
    try {
      const response = await fetch(`${this.baseUrl}/transferrecipient`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create transfer recipient')
      }

      return result.data
    } catch (error) {
      throw new Error(`Transfer recipient creation failed: ${error.message}`)
    }
  }

  async initiateTransfer(data) {
    try {
      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to initiate transfer')
      }

      return result.data
    } catch (error) {
      throw new Error(`Transfer initiation failed: ${error.message}`)
    }
  }

  // Simulate payment for dry run mode
  async simulatePayment(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      domain: 'test',
      amount: data.amount,
      currency: data.currency || 'NGN',
      source: data.source,
      reason: data.reason,
      recipient: data.recipient,
      status: 'PAID',
      transfer_code: `TRF_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

// Create and export a single instance
export const paystack = new PaystackService() 