import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <nav className="border-b border-primary-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">SyneUDP</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-primary-200 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="bg-white text-primary-900 px-4 py-2 rounded-lg font-medium hover:bg-primary-100 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Managed Database Platform
          </h1>
          <p className="text-xl text-primary-200 mb-12 max-w-3xl mx-auto">
            Deploy MySQL and PostgreSQL databases in seconds. Pay only for what
            you use with our hourly billing model. Scale effortlessly as your
            needs grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-primary-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-100 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="border-2 border-primary-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700/50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              MySQL and PostgreSQL
            </h3>
            <p className="text-primary-200">
              Choose between two powerful database engines. Both fully managed
              with automatic backups and updates.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Pay Per Hour
            </h3>
            <p className="text-primary-200">
              No upfront costs or long-term commitments. Pay only for the hours
              your database is running.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Instant Provisioning
            </h3>
            <p className="text-primary-200">
              Get your database up and running in seconds. Connection details
              provided immediately.
            </p>
          </div>
        </div>

        <div className="mt-32 bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-primary-500/30">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-primary-800/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
              <p className="text-primary-300 mb-6">
                Perfect for development and small projects
              </p>
              <div className="text-4xl font-bold text-white mb-6">
                $0.05<span className="text-lg font-normal">/hour</span>
              </div>
              <ul className="space-y-3 text-primary-200">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  1 vCPU
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  1GB RAM
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  10GB Storage
                </li>
              </ul>
            </div>
            <div className="bg-primary-800/50 rounded-2xl p-8 ring-2 ring-primary-400">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-primary-300 mb-6">
                For production workloads and scaling
              </p>
              <div className="text-4xl font-bold text-white mb-6">
                $0.15<span className="text-lg font-normal">/hour</span>
              </div>
              <ul className="space-y-3 text-primary-200">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  2 vCPU
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  4GB RAM
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  50GB Storage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary-700/50 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <span className="text-primary-300">
              2024 SyneUDP. All rights reserved.
            </span>
            <div className="flex gap-6">
              <Link href="#" className="text-primary-300 hover:text-white">
                Terms
              </Link>
              <Link href="#" className="text-primary-300 hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
