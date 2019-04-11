export default class APIError extends Error {
  constructor(message: string, originalError?: any) {
    super(message);
    if (originalError) {
      this.message += `: ${originalError.message}`;
    }
  }

  toString() {
    return JSON.stringify({ error: true, message: this.message });
  }
}
