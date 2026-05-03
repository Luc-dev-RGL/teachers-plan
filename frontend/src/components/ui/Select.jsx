export default function Select({ label, valeur, onChange, options, placeholder = 'Sélectionner...', disabled = false }) {
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <select
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="select-field"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}