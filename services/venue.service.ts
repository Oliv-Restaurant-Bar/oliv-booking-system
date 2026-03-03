/**
 * Venue Service
 * Manages restaurant venue/locations for bookings.
 * Uses API for CRUD operations.
 */

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const VenueService = {
  /**
   * Get all venue locations
   */
  async getLocations(): Promise<string[]> {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const venues: Venue[] = await response.json();
        return venues.map((v) => v.name);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
    return [];
  },

  /**
   * Get all venue objects
   */
  async getAll(): Promise<Venue[]> {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
    return [];
  },

  /**
   * Add a new location
   */
  async addLocation(name: string, description?: string): Promise<Venue | null> {
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || null }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        console.error('Error adding venue:', error.error);
        return null;
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      return null;
    }
  },

  /**
   * Update an existing location
   */
  async updateLocation(id: string, name: string, description?: string): Promise<Venue | null> {
    try {
      const response = await fetch(`/api/venues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || null }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        console.error('Error updating venue:', error.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating venue:', error);
      return null;
    }
  },

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/venues/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        console.error('Error deleting venue:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      return false;
    }
  },

  /**
   * Find venue by name
   */
  async findByName(name: string): Promise<Venue | null> {
    const venues = await this.getAll();
    return venues.find((v) => v.name === name) || null;
  },
};
