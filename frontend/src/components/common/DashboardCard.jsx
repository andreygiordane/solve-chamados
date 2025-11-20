const DashboardCard = ({ title, count, color }) => (
  <div className={`${color} rounded-lg p-5 text-white shadow-lg flex flex-col justify-between h-32 hover:brightness-110 transition-all`}>
    <h3 className="text-xs font-bold uppercase tracking-wide opacity-90">{title}</h3>
    <p className="text-5xl font-light tracking-tighter">{count}</p>
  </div>
);

export default DashboardCard;