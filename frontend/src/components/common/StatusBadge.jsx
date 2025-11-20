const StatusBadge = ({ status }) => {
  const styles = {
    aberto: "bg-green-500/10 text-green-500 border-green-500/20",
    em_andamento: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    concluido: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    pendente: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    cancelado: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  return (
    <span className={`px-2 py-1 rounded border text-xs font-medium uppercase tracking-wide ${styles[status] || styles.aberto}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;