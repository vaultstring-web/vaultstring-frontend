export default function HomePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-10 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
          Fintech Platform Scaffold
        </h1>

        <p className="text-gray-600 text-center mb-6">
          The core platform structure is ready. Authentication pages, onboarding wizard, dashboard, and backend logic will be added next by the engineering team.
        </p>

        <div className="flex flex-col space-y-3">
          <a
            href="/login"
            className="w-full bg-blue-600 text-white text-center py-3 rounded-md hover:bg-blue-700 transition"
          >
            Go to Login
          </a>

          <a
            href="/signup"
            className="w-full bg-gray-100 text-gray-800 text-center py-3 rounded-md hover:bg-gray-200 transition"
          >
            Create an Account
          </a>
        </div>
      </div>
    </main>
  );
}
