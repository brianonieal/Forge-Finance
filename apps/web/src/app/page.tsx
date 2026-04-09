export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-text-primary">
        Forge Finance
      </h1>
      <p className="text-lg text-text-secondary max-w-md text-center">
        Your finances, explained by AI.
      </p>
      <div className="flex gap-4">
        <span className="font-money text-2xl text-gain">
          +$1,234.56
        </span>
        <span className="font-money text-2xl text-loss">
          ($789.01)
        </span>
      </div>
      <p className="text-sm text-text-secondary">
        v0.0.0 Foundation — Design tokens active
      </p>
    </main>
  );
}
