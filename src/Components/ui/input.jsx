// src/components/ui/input.jsx
export function Input({ value, onChange, placeholder }) {
    return (
      <input
        type="text"
        className="border p-2 rounded w-full"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
  