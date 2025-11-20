const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

export default Card;