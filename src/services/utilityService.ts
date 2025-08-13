import type { EntityType, EntityTypesResponse, PincodeData, BanksResponse } from '@/types/utility'

const API_BASE = import.meta.env.VITE_API_BASE_URL

class UtilityService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getCookie('auth_token')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const raw = await response.text().catch(() => '')

    if (!response.ok) {
      let message = `Request failed: ${response.status}`
      if (raw) {
        try {
          message = JSON.parse(raw).message || message
        } catch {
          message = raw
        }
      }
      console.log(message)
      throw new Error('Request failed')
    }

    if (!raw || response.status === 204 || response.status === 205) {
      return undefined as unknown as T
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  // Get entity types
  async getEntityTypes(): Promise<EntityTypesResponse> {
    return this.request<EntityTypesResponse>('/entity-types', {
      method: 'GET',
    })
  }

  // Verify pincode
  async verifyPincode(pincode: string): Promise<PincodeData> {
    return this.request<PincodeData>(`/pincodes/${pincode}`, {
      method: 'GET',
    })
  }

  // Get banks list
  async getBanksList(): Promise<BanksResponse[]> {
    return this.request<BanksResponse[]>('/get-banks-list', {
      method: 'GET',
    })
  }
}

export const utilityService = new UtilityService() 