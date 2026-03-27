export interface Name {
    first: string
    last: string
}

export interface Address {
    street: string
    city: string
    state: string
    country: string
    postcode: string
}

export interface Profile {
  avatar: string
}

export interface User {
    id: string
    name: Name
    gender: "male" | "female"
    email: string
    role: "admin" | "customer"
    createdAt: string
    address: Address
    profile: Profile
}