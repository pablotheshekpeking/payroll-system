class PaystackError extends Error {
  constructor(message, code, response) {
    super(message)
    this.name = 'PaystackError'
    this.code = code
    this.response = response
  }
}

class PaystackService {
  constructor() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET

    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined')
    }

    if (!webhookSecret) {
      throw new Error('PAYSTACK_WEBHOOK_SECRET is not defined')
    }

    this.secretKey = secretKey
    this.webhookSecret = webhookSecret
    this.baseUrl = 'https://api.paystack.co'
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new PaystackError(
        data.message || 'An error occurred with Paystack',
        data.code,
        data
      )
    }

    return data.data
  }

  async createTransferRecipient(data) {
    try {
      return await this.request('/transferrecipient', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      if (error instanceof PaystackError) {
        throw error
      }
      throw new PaystackError('Failed to create transfer recipient')
    }
  }

  async initiateTransfer(data) {
    try {
      return await this.request('/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      if (error instanceof PaystackError) {
        throw error
      }
      throw new PaystackError('Failed to initiate transfer')
    }
  }

  async verifyTransfer(reference) {
    try {
      return await this.request(`/transfer/verify/${reference}`)
    } catch (error) {
      if (error instanceof PaystackError) {
        throw error
      }
      throw new PaystackError('Failed to verify transfer')
    }
  }

  async getBalance() {
    try {
      return await this.request('/balance')
    } catch (error) {
      if (error instanceof PaystackError) {
        throw error
      }
      throw new PaystackError('Failed to fetch balance')
    }
  }

  verifyWebhookSignature(signature, payload) {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(payload)
      .digest('hex')
    return hash === signature
  }
}

export const paystack = new PaystackService() 