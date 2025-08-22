
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center w-full h-full py-16 ${className || ''}`}>
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--accent-amber,#FFA500)] border-opacity-80"></div>
    <span className="ml-6 text-xl font-semibold text-white tracking-wide drop-shadow-lg">Loading...</span>
  </div>
);

export default Spinner;
