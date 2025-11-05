import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear it
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  // Authentication
  async signUp(data: { wallet_address: string; signature: string; message: string; role?: string; artist_name?: string }) {
    const response = await this.client.post('/auth/sign_up', data);
    if (response.data.user) {
      // Token should be in Authorization header from backend
      const token = response.headers.authorization?.replace('Bearer ', '');
      if (token) {
        this.setToken(token);
      }
    }
    return response.data;
  }

  async signIn(data: { wallet_address: string; signature: string; message: string }) {
    const response = await this.client.post('/auth/sign_in', data);
    if (response.data.user) {
      const token = response.headers.authorization?.replace('Bearer ', '');
      if (token) {
        this.setToken(token);
      }
    }
    return response.data;
  }

  async signOut() {
    await this.client.delete('/auth/sign_out');
    this.clearToken();
  }

  // Artists
  async getArtists(params?: any) {
    const response = await this.client.get('/artists', { params });
    return response.data;
  }

  async getArtist(id: number) {
    const response = await this.client.get(`/artists/${id}`);
    return response.data;
  }

  async searchArtists(query: string) {
    const response = await this.client.get('/artists', { params: { q: query } });
    return response.data;
  }

  // Tokens
  async getTokens(params?: any) {
    const response = await this.client.get('/tokens', { params });
    return response.data;
  }

  async getToken(id: number) {
    const response = await this.client.get(`/tokens/${id}`);
    return response.data;
  }

  async createToken(data: any) {
    const response = await this.client.post('/tokens', data);
    return response.data;
  }

  async buyToken(id: number, data: { amount: number; max_price: number; transaction_signature: string }) {
    const response = await this.client.post(`/tokens/${id}/buy`, data);
    return response.data;
  }

  async sellToken(id: number, data: { amount: number; min_price: number; transaction_signature: string }) {
    const response = await this.client.post(`/tokens/${id}/sell`, data);
    return response.data;
  }

  async getTokenTrades(id: number) {
    const response = await this.client.get(`/tokens/${id}/trades`);
    return response.data;
  }

  // Albums & Tracks
  async getAlbums(params?: any) {
    const response = await this.client.get('/albums', { params });
    return response.data;
  }

  async getAlbum(id: number) {
    const response = await this.client.get(`/albums/${id}`);
    return response.data;
  }

  async getTracks(params?: any) {
    const response = await this.client.get('/tracks', { params });
    return response.data;
  }

  async getTrack(id: number) {
    const response = await this.client.get(`/tracks/${id}`);
    return response.data;
  }

  async streamTrack(id: number) {
    const response = await this.client.get(`/tracks/${id}/stream`);
    return response.data;
  }

  async logStream(id: number, duration: number) {
    const response = await this.client.post(`/tracks/${id}/log_stream`, { duration });
    return response.data;
  }

  async updateTrackAccess(trackId: number, data: { access_tier: string; free_quality?: string }) {
    const response = await this.client.patch(`/tracks/${trackId}/update_access`, { track: data });
    return response.data;
  }

  async bulkUpdateTrackAccess(albumId: number, data: { track_ids: number[]; access_tier: string }) {
    const response = await this.client.patch(`/albums/${albumId}/bulk_update_track_access`, data);
    return response.data;
  }

  // Events
  async getEvents(params?: any) {
    const response = await this.client.get('/events', { params });
    return response.data;
  }

  async getEvent(id: number) {
    const response = await this.client.get(`/events/${id}`);
    return response.data;
  }

  async purchaseTicket(eventId: number, data: any) {
    const response = await this.client.post(`/events/${eventId}/purchase_ticket`, data);
    return response.data;
  }

  // Livestreams
  async getLivestreams(params?: any) {
    const response = await this.client.get('/livestreams', { params });
    return response.data;
  }

  async getLivestream(id: number) {
    const response = await this.client.get(`/livestreams/${id}`);
    return response.data;
  }

  async createLivestream(data: any) {
    const response = await this.client.post('/livestreams', { livestream: data });
    return response.data;
  }

  async startLivestream(id: number) {
    const response = await this.client.post(`/livestreams/${id}/start`);
    return response.data;
  }

  async stopLivestream(id: number) {
    const response = await this.client.post(`/livestreams/${id}/stop`);
    return response.data;
  }

  async getLivestreamStatus(id: number) {
    const response = await this.client.get(`/livestreams/${id}/status`);
    return response.data;
  }

  async tipLivestream(id: number, data: { amount: number; mint: string; signature: string }) {
    const response = await this.client.post(`/livestreams/${id}/tip`, data);
    return response.data;
  }

  // Profile
  async getProfile() {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/profile', data);
    return response.data;
  }

  // Playlists
  async getUserPlaylists() {
    const response = await this.client.get('/playlists');
    return response.data;
  }

  async getPlaylist(id: number) {
    const response = await this.client.get(`/playlists/${id}`);
    return response.data;
  }

  async createPlaylist(data: any) {
    const response = await this.client.post('/playlists', { playlist: data });
    return response.data;
  }

  async updatePlaylist(id: number, data: any) {
    const response = await this.client.patch(`/playlists/${id}`, { playlist: data });
    return response.data;
  }

  async deletePlaylist(id: number) {
    const response = await this.client.delete(`/playlists/${id}`);
    return response.data;
  }

  async addTrackToPlaylist(playlistId: number, trackId: number) {
    const response = await this.client.post(`/playlists/${playlistId}/tracks`, { track_id: trackId });
    return response.data;
  }

  async removeTrackFromPlaylist(playlistId: number, trackId: number) {
    const response = await this.client.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  }

  // Search
  async search(query: string, filters?: any) {
    const response = await this.client.get('/search', { params: { q: query, ...filters } });
    return response.data;
  }

  // Platform
  async getPlatformMetrics() {
    const response = await this.client.get('/platform/metrics');
    return response.data;
  }

  async getPlatformToken() {
    const response = await this.client.get('/platform/token');
    return response.data;
  }

  // Merch
  async getMerchItems(params?: any) {
    const response = await this.client.get('/merch', { params });
    return response.data;
  }

  async getMerchItem(id: number) {
    const response = await this.client.get(`/merch/${id}`);
    return response.data;
  }

  // Fan Passes
  async getFanPasses(params?: any) {
    const response = await this.client.get('/fan_passes', { params });
    return response.data;
  }

  async getFanPass(id: number) {
    const response = await this.client.get(`/fan_passes/${id}`);
    return response.data;
  }

  async createFanPass(data: any) {
    const response = await this.client.post('/fan_passes', data);
    return response.data;
  }

  async purchaseFanPass(id: number, data: { transaction_signature: string }) {
    const response = await this.client.post(`/fan_passes/${id}/purchase`, data);
    return response.data;
  }

  async getFanPassHolders(id: number) {
    const response = await this.client.get(`/fan_passes/${id}/holders`);
    return response.data;
  }

  async getFanPassDividends(id: number) {
    const response = await this.client.get(`/fan_passes/${id}/dividends`);
    return response.data;
  }

  async distributeDividends(id: number, data: { period_start?: string; period_end?: string; revenue_by_source: any }) {
    const response = await this.client.post(`/fan_passes/${id}/distribute_dividends`, data);
    return response.data;
  }

  // Orders
  async createOrder(data: any) {
    const response = await this.client.post('/orders', { order: data });
    return response.data;
  }

  async getMyOrders(params?: any) {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: number) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }
}

export const api = new ApiClient();
export default api;

