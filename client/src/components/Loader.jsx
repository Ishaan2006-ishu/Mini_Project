const Loader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    <p className="text-sm text-gray-500 font-medium">{text}</p>
  </div>
)
export default Loader