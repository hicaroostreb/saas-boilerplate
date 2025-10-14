import { Email } from '../value-objects/Email';

/**
 * Entidade User - Modelo rico com invariantes de domínio
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly name: string,
    public readonly passwordHash: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(props: {
    id: string;
    email: string;
    name: string;
  }): User {
    const emailVO = Email.create(props.email);
    return new User(
      props.id,
      emailVO,
      props.name.trim(),
      null,
      true,
      new Date(),
      new Date()
    );
  }

  public static reconstitute(props: {
    id: string;
    email: string;
    name: string;
    passwordHash: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const emailVO = Email.create(props.email);
    return new User(
      props.id,
      emailVO,
      props.name,
      props.passwordHash,
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  public changePassword(newHash: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      newHash,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      false,
      this.createdAt,
      new Date()
    );
  }

  public canAuthenticate(): boolean {
    return this.isActive && this.passwordHash !== null;
  }
}
