export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer spinning circle */}
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        {/* Inner spinning circle */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        {/* Loading text */}
        <div className="mt-4 text-center text-gray-600 font-medium">
          Loading...
        </div>
      </div>
    </div>
  );
}
