import { HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { deleteByRegex } from './deleteByRegex';
import { DefaultHttpCacheStorage, HttpCacheStorage } from './httpCacheStorage';
import { HTTP_CACHE_CONFIG, HttpCacheConfig } from './httpCacheConfig';
import { getLocalStorage } from './getLocalStorage';
import { setLocalStorage } from './setLocalStorage';

@Injectable()
export class HttpCacheLocalStorage implements HttpCacheStorage {
  private readonly cache = new DefaultHttpCacheStorage();
  private readonly storageKey: string;

  constructor(@Inject(HTTP_CACHE_CONFIG) private config: HttpCacheConfig) {
    this.storageKey = config.localStorageKey;
  }

  has(key: string): boolean {
    return this.cache.has(key) || getLocalStorage(this.storageKey).has(key);
  }

  get(key: string): HttpResponse<any> {
    const cacheValue = this.cache.get(key);
    if (cacheValue) {
      return cacheValue;
    }

    const value = getLocalStorage(this.storageKey).get(key);
    if (value) {
      const response = new HttpResponse(value);
      this.cache.set(key, response);
    }

    return this.cache.get(key);
  }

  set(key: string, response: HttpResponse<any>): void {
    const storage = getLocalStorage(this.storageKey);
    storage.set(key, response);
    setLocalStorage(this.storageKey, storage);
    this.cache.set(key, response);
  }

  delete(key?: string | RegExp): void {
    this.cache.delete(key);

    if (!key) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    const storage = getLocalStorage(this.storageKey);

    if (typeof key === 'string') {
      storage.delete(key);
      setLocalStorage(this.storageKey, storage);
      return;
    }

    deleteByRegex(key as RegExp, storage);
    setLocalStorage(this.storageKey, storage);
  }
}
