const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button 
    onClick={onClick} 
    className={`${color} text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default ActionButton;