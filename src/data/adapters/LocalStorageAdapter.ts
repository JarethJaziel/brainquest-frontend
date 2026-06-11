const CURRENT_VERSION = '1.0';

export class LocalStorageAdapter<T> {
  private key: string;
  private defaultValue: T;
  private migrations?: Record<string, (data: unknown) => T>;

  constructor(
    key: string,
    defaultValue: T,
    migrations?: Record<string, (data: unknown) => T>
  ) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.migrations = migrations;
  }

  get(): T {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        // Initialize with default value if not present
        this.set(this.defaultValue);
        return this.defaultValue;
      }

      const parsed = JSON.parse(raw);
      const version = localStorage.getItem(`${this.key}_version`) || '1.0';

      if (version !== CURRENT_VERSION && this.migrations?.[version]) {
        const migrated = this.migrations[version](parsed);
        this.set(migrated);
        return migrated;
      }

      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage key "${this.key}":`, error);
      return this.defaultValue;
    }
  }

  set(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
      localStorage.setItem(`${this.key}_version`, CURRENT_VERSION);
    } catch (error) {
      console.error(`Error writing to localStorage key "${this.key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
      localStorage.removeItem(`${this.key}_version`);
    } catch (error) {
      console.error(`Error clearing localStorage key "${this.key}":`, error);
    }
  }
}
