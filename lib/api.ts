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
      // Always check localStorage for the latest token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          this.token = token; // Update cached token
        }
      } else if (this.token) {
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
          // Don't redirect here - let individual pages handle it
          // to prevent refresh loops
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getAuthToken() {
    return this.token;
  }

  // Generic HTTP methods
  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
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

  async getArtistProfile(id: number) {
    const response = await this.client.get(`/artists/${id}/profile`);
    return response.data;
  }

  async searchArtists(query: string) {
    const response = await this.client.get('/artists', { params: { q: query } });
    return response.data;
  }

  async followArtist(id: number) {
    const response = await this.client.post(`/artists/${id}/follow`);
    return response.data;
  }

  async unfollowArtist(id: number) {
    const response = await this.client.delete(`/artists/${id}/follow`);
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

  // Comments
  async getComments(contentType: string, contentId: number) {
    const response = await this.client.get(`/${contentType}/${contentId}/comments`);
    return response.data;
  }

  async createComment(contentType: string, contentId: number, content: string, parentId?: number) {
    const response = await this.client.post(`/${contentType}/${contentId}/comments`, {
      comment: { content, parent_id: parentId }
    });
    return response.data;
  }

  async deleteComment(commentId: number) {
    const response = await this.client.delete(`/comments/${commentId}`);
    return response.data;
  }

  // Likes
  async likeContent(contentType: string, contentId: number) {
    const response = await this.client.post(`/${contentType}/${contentId}/like`);
    return response.data;
  }

  async unlikeContent(contentType: string, contentId: number) {
    const response = await this.client.delete(`/${contentType}/${contentId}/like`);
    return response.data;
  }

  async getLikes(contentType: string, contentId: number) {
    const response = await this.client.get(`/${contentType}/${contentId}/likes`);
    return response.data;
  }

  // Notifications
  async getNotifications(params?: any) {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: number) {
    const response = await this.client.post(`/notifications/${id}/mark_as_read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.post('/notifications/mark_all_as_read');
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

  // Videos
  async getVideos(params?: { artist_id?: number; sort?: string; page?: number }) {
    const response = await this.client.get('/videos', { params });
    return response.data;
  }

  async getVideo(id: number) {
    const response = await this.client.get(`/videos/${id}`);
    return response.data;
  }

  async createVideo(data: any) {
    const response = await this.client.post('/videos', { video: data });
    return response.data;
  }

  async updateVideo(id: number, data: any) {
    const response = await this.client.patch(`/videos/${id}`, { video: data });
    return response.data;
  }

  async deleteVideo(id: number) {
    const response = await this.client.delete(`/videos/${id}`);
    return response.data;
  }

  async publishVideo(id: number) {
    const response = await this.client.post(`/videos/${id}/publish`);
    return response.data;
  }

  async watchVideo(id: number) {
    const response = await this.client.get(`/videos/${id}/watch`);
    return response.data;
  }

  async logVideoView(id: number, watchedDuration: number, accessTier: string) {
    const response = await this.client.post(`/videos/${id}/log_view`, {
      watched_duration: watchedDuration,
      access_tier: accessTier
    });
    return response.data;
  }

  async purchaseVideo(id: number, transactionSignature: string) {
    const response = await this.client.post(`/videos/${id}/purchase`, {
      transaction_signature: transactionSignature
    });
    return response.data;
  }

  // Minis (short-form content)
  async getMinis(params?: { artist_id?: number; sort?: string; page?: number }) {
    const response = await this.client.get('/minis', { params });
    return response.data;
  }

  async getMiniFeed() {
    const response = await this.client.get('/minis/feed');
    return response.data;
  }

  async getTrendingMinis() {
    const response = await this.client.get('/minis/trending');
    return response.data;
  }

  async getFollowingMinis() {
    const response = await this.client.get('/minis/following');
    return response.data;
  }

  async getMini(id: number) {
    const response = await this.client.get(`/minis/${id}`);
    return response.data;
  }

  async createMini(data: any) {
    const response = await this.client.post('/minis', { mini: data });
    return response.data;
  }

  async updateMini(id: number, data: any) {
    const response = await this.client.patch(`/minis/${id}`, { mini: data });
    return response.data;
  }

  async deleteMini(id: number) {
    const response = await this.client.delete(`/minis/${id}`);
    return response.data;
  }

  async publishMini(id: number) {
    const response = await this.client.post(`/minis/${id}/publish`);
    return response.data;
  }

  async watchMini(id: number) {
    const response = await this.client.get(`/minis/${id}/watch`);
    return response.data;
  }

  async logMiniView(id: number, watchedDuration: number, accessTier: string) {
    const response = await this.client.post(`/minis/${id}/log_view`, {
      watched_duration: watchedDuration,
      access_tier: accessTier
    });
    return response.data;
  }

  async shareMini(id: number) {
    const response = await this.client.post(`/minis/${id}/share`);
    return response.data;
  }

  async purchaseMini(id: number, transactionSignature: string) {
    const response = await this.client.post(`/minis/${id}/purchase`, {
      transaction_signature: transactionSignature
    });
    return response.data;
  }
}

export const api = new ApiClient();
export default api;

