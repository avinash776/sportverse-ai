// ==================================================
// SportVerse AI - Empty State Component
// ==================================================

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="mx-auto text-gray-300 mb-4" size={48} />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
