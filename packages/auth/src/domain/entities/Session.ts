export interface SessionData {
  type: string;
  email?: string;
  createdAt: string;
  [key: string]: string | number | boolean | null | undefined;
}

export class Session {
  constructor(
    public readonly userId: string,
    public readonly sessionToken: string,
    public readonly expires: Date,
    public readonly sessionData?: SessionData
  ) {}

  static create(data: {
    userId: string;
    sessionToken: string;
    expires: Date;
    sessionData?: SessionData;
  }): Session {
    return new Session(
      data.userId,
      data.sessionToken,
      data.expires,
      data.sessionData
    );
  }
}
