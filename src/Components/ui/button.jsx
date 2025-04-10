// src/components/ui/button.jsx
export function Button({ onClick, children }) {
    return (
      <button
        onClick={onClick}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {children}
      </button>
    );
  }
  