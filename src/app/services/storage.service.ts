import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private ionStorage: Storage) {
    this.init();
  }

  /**
   * Set an item to the indexedDB storage.
   * @param key - Key of the item.
   * @param value - Value of the item.
   */
  public async setItem(key: string, value: any) {
    return this.ionStorage.set(key, value);
  }

  /**
   * Get an item by key asynchronously.
   * @param key - Key of the item.
   */
  public async getItem(key: string): Promise<any> {
    return this.ionStorage.get(key);
  }

  /**
   * Remove an item by key.
   * @param key - Key of the item.
   */
  public async removeItem(key: string): Promise<any> {
    return this.ionStorage.remove(key);
  }

  /**
   * Clear all keys on the storage.
   * Careful to use the method, as it will clear all data on the storage.
   */
  public clear(): Promise<void> {
    return this.ionStorage.clear();
  }

  private async init() {
    await this.ionStorage.create();
    return;
  }
}
