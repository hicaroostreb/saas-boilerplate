export class IpExtractor {
  static extract(
    headers: Record<string, string | string[] | undefined>,
    fallbackIp?: string
  ): string {
    const forwarded = this.getHeader(headers, 'x-forwarded-for');
    if (forwarded) {
      return this.parseForwarded(forwarded);
    }

    const realIp = this.getHeader(headers, 'x-real-ip');
    if (realIp) {
      return realIp;
    }

    const cfConnectingIp = this.getHeader(headers, 'cf-connecting-ip');
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    return fallbackIp ?? 'unknown';
  }

  private static getHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string
  ): string | undefined {
    const value = headers[key.toLowerCase()];
    if (!value) {
      return undefined;
    }
    return Array.isArray(value) ? value[0] : value;
  }

  private static parseForwarded(forwarded: string): string {
    const parts = forwarded.split(',');
    const firstIp = parts[0];
    return firstIp?.trim() ?? 'unknown';
  }
}
