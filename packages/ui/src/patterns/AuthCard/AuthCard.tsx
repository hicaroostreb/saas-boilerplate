'use client';

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const AuthCard = ({
  title,
  description,
  children,
  footerContent,
}: AuthCardProps) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-6 pt-0 flex flex-col gap-4">{children}</div>
      {footerContent && (
        <div className="items-center p-6 pt-0 flex justify-center gap-1 text-sm text-muted-foreground">
          {footerContent}
        </div>
      )}
    </div>
  );
};
