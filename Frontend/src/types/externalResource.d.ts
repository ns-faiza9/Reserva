/** External resource from GitHub JSON API (ns-faiza9/Booking-api-data) */
export interface ExternalResource {
  id: number;
  name: string;
  type: string;
  location: string;
  price_per_hour: number;
  capacity: number;
  image: string;
  available: boolean;
}
