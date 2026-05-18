/**
 * Beds24 API V2 Utility
 * Handles bidirectional synchronization between HosFlow (PMS) and OTAs.
 */

import { secureStorage } from './secureStorage';
import { logError } from './errorHandler';

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
      logError('beds24', 'Auth validation error', { message: error.message });
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
          'token': secureStorage.getSensitive('beds24_token'),
          'invite-token': secureStorage.getSensitive('beds24_invite_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      logError('beds24', 'Sync inventory error', { message: error.message });
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
          'token': secureStorage.getSensitive('beds24_token'),
          'invite-token': secureStorage.getSensitive('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      logError('beds24', 'Get bookings error', { message: error.message });
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
          'token': secureStorage.getSensitive('beds24_token'),
          'invite-token': secureStorage.getSensitive('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      logError('beds24', 'Get properties error', { message: error.message });
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
          'token': secureStorage.getSensitive('beds24_token'),
          'invite-token': secureStorage.getSensitive('beds24_invite_token'),
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      logError('beds24', 'Get rooms error', { message: error.message });
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
