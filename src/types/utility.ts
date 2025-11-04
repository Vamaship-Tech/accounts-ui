export interface EntityType {
  id: number
  entity_type: string
}

export interface EntityTypesResponse {
  masters: EntityType[]
}

export interface PincodeData {
  pincode: string
  city: string
  state: string
  district: string
  country: string
  isActive: boolean
}

export interface BankData {
  id: number
  name: string
}

export interface BanksResponse {
  banks: BankData[]
} 