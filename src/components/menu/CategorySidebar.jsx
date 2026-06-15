import React from "react";

export default function CategorySidebar({ categories, activeCatId, onSelect, t }) {
  return (
    <aside className="mp-sidebar">
      <div className="mp-sidebar-label">{t?.kategoriyalar || "Kategoriyalar"}</div>
      <ul className="mp-cat-list">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              className={`mp-cat-btn${activeCatId === cat.id ? " mp-cat-active" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <span className="mp-cat-icon">{cat.icon}</span>
              <span className="mp-cat-name">{cat.nomi}</span>
              <span className="mp-cat-count">{cat.mahsulotlar?.length || 0}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
