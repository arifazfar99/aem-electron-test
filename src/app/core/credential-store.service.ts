import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb-browser';

interface CredentialDoc {
  _id: string;
  _rev?: string;
  salt: string;
  hash: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredentialStoreService {
  private db = new PouchDB<CredentialDoc>('credentials');

  async save(username: string, password: string, token: string): Promise<void> {
    const id = username.toLowerCase();
    const salt = this.toHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await this.hash(password, salt);
    const existing = await this.db.get(id).catch(() => null);

    await this.db.put({ _id: id, _rev:  existing?._rev, salt, hash, token });
  }

  async verify(username: string, password: string): Promise<string | null> {
    try {
      const doc = await this.db.get(username.toLowerCase());
      const hash = await this.hash(password, doc.salt);
      return hash === doc.hash ? doc.token : null;
    } catch {
      return null;
    }
  }

  private async hash(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
      key,
      256
    );
    return this.toHex(new Uint8Array(bits));
  }

  private toHex(bytes: Uint8Array): string {
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

}
