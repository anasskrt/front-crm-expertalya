
export interface QuoteData {
  location: string;
  departureDate: Date;
  departureTime: string;
  returnDate: Date;
  returnTime: string;
  carModel: string;
  name: string;
  email: string;
  phone: string;
}

export interface SimplifiedQuoteData {
  departureDate: Date;
  departureTime: string;
  returnDate: Date;
  returnTime: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface CarInformation {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
}