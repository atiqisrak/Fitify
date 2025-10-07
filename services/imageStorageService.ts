/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface GeneratedImage {
  id: string;
  userImageUrl: string;
  modelImageUrl: string;
  garmentId?: string;
  garmentName?: string;
  generatedImageUrl: string;
  timestamp: number;
  poseInstruction?: string;
}

const STORAGE_KEY = 'fitify_generated_images';
const MAX_IMAGES = 100; // Limit to prevent localStorage overflow

class ImageStorageService {
  private images: GeneratedImage[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.images = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load images from storage:', error);
      this.images = [];
    }
  }

  private saveToStorage(): void {
    try {
      // Keep only the most recent MAX_IMAGES
      const imagesToStore = this.images.slice(-MAX_IMAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imagesToStore));
      this.images = imagesToStore;
    } catch (error) {
      console.error('Failed to save images to storage:', error);
    }
  }

  // Generate a unique key for caching lookups
  private generateCacheKey(userImageUrl: string, garmentId?: string, poseInstruction?: string): string {
    return `${userImageUrl}_${garmentId || 'base'}_${poseInstruction || 'default'}`;
  }

  // Check if we have a cached image for this combination
  getCachedImage(userImageUrl: string, garmentId?: string, poseInstruction?: string): string | null {
    const cacheKey = this.generateCacheKey(userImageUrl, garmentId, poseInstruction);
    const cached = this.images.find(img => 
      this.generateCacheKey(img.userImageUrl, img.garmentId, img.poseInstruction) === cacheKey
    );
    return cached?.generatedImageUrl || null;
  }

  // Store a generated image
  storeImage(image: Omit<GeneratedImage, 'id' | 'timestamp'>): GeneratedImage {
    const newImage: GeneratedImage = {
      ...image,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.images.push(newImage);
    this.saveToStorage();
    return newImage;
  }

  // Get all images for a specific user image
  getImagesForUser(userImageUrl: string): GeneratedImage[] {
    return this.images.filter(img => img.userImageUrl === userImageUrl);
  }

  // Get all stored images
  getAllImages(): GeneratedImage[] {
    return [...this.images];
  }

  // Delete a specific image
  deleteImage(id: string): boolean {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      this.images.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Clear all stored images
  clearAll(): void {
    this.images = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // Get the most recent image
  getMostRecentImage(): GeneratedImage | null {
    return this.images.length > 0 ? this.images[this.images.length - 1] : null;
  }
}

export const imageStorageService = new ImageStorageService();

