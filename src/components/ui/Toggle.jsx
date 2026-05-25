export default function Toggle({ checked, onChange, disabled }) {
  return (
    <label className={`toggle-switch ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </label>
  );
}
