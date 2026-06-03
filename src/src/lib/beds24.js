/**
 * Beds24 API V2 Utility
 * Handles bidirectional synchronization between HosFlow (PMS) and OTAs.
 */

const BEDS24_API_BASE = 'https://api.beds24.com/v2';

export const beds24 = {
  /**
   * Validate API Keys
   * @param {string} token - Account Token
   * @param {string} inviteToken - Invite Token
   */
  async validateAuth(token, inviteToken) {
    try {
      const response = await fetch(`${BEDS24_API_BASE}/authentication/setup`, {
        method: 'GET',
        headers: {
          'token': token,
          'invite-token': inviteToken,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Beds24 Auth Error:', error);
      throw error;
    }
  },

  /**
   * Sync Inventory / Calendar
   * @param {Object} data - Inventory data (roomID, offerID, dates, qty, prices)
   */
  async syncInventory(data) {
    // Optimization: Batch updates to avoid rate limiting
    try {
      const response = await fetch(`${BEDS24_API_BASE}/inventory/calendar`, {
        method: 'POST',
        headers: {
          'token': localStorage.getItem('beds24_token'),
          'invite-token': localStorage.getItem('beds24_invite_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Beds24 Sync Error:', error);
      throw error;
    }
  },

  /**
   * Import Bookings
   */
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    try {
      const response = await fetch(`${BEDS24_API_BASE}/bookings?${queryString}`, {
        method: 'GET',
        headers: {
          'token': localStorage.getItem('beds24_token'),
          'invite-token': localStorage.getItem('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Beds24 Booking Import Error:', error);
      throw error;
    }
  },

  /**
   * Get Properties
   */
  async getProperties() {
    try {
      const response = await fetch(`${BEDS24_API_BASE}/properties`, {
        method: 'GET',
        headers: {
          'token': localStorage.getItem('beds24_token'),
          'invite-token': localStorage.getItem('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Beds24 Properties Error:', error);
      throw error;
    }
  },

  /**
   * Get Rooms for a specific property
   */
  async getRooms(propId) {
    try {
      const response = await fetch(`${BEDS24_API_BASE}/rooms?propId=${propId}`, {
        method: 'GET',
        headers: {
          'token': localStorage.getItem('beds24_token'),
          'invite-token': localStorage.getItem('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Beds24 Rooms Error:', error);
      throw error;
    }
  },

  /**
   * Automatic Mapping Function
   * Maps PMS room/offer IDs to Beds24/Channel IDs
   */
  mapIDs(pmsData, beds24Config) {
    return pmsData.map(item => ({
      ...item,
      beds24RoomId: beds24Config.roomMapping[item.pmsRoomId],
      beds24OfferId: beds24Config.offerMapping[item.pmsOfferId]
    }));
  }
};
