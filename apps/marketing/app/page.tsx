import { Header } from "@workspace/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header 
        logoText="Acme"
        signInUrl="http://localhost:3001/auth/sign-in"
        signUpUrl="http://localhost:3001/auth/sign-up"
      />
      
      <main className="container mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your revolutionary<br />Next.js SaaS
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            This is a demo application built with Achromatic. It will save you time and effort building your next SaaS.
          </p>
          
          <div className="flex gap-4 justify-center">
            <a 
              href="http://localhost:3001/auth/sign-up"
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 rounded-xl"
            >
              Start for free
            </a>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-xl"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
