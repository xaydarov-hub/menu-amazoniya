import React from "react";

export default function FilterBar({ search, onSearch, tags, activeTag, onTag, sortBy, onSort, isBar, t }) {
  return (
    <div className="mp-filterbar">
      <div className="mp-search-wrap">
        <span className="mp-search-icon">🔍</span>
        <input
          type="search"
          className="mp-search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={isBar ? (t?.qidirish_bar || "Ichimlik qidirish...") : (t?.qidirish_ovqat || "Taom qidirish...")}
        />
        {search && (
          <button
            className="mp-search-clear"
            onClick={() => onSearch("")}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mp-tags">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`mp-tag${activeTag === tag.id ? " mp-tag-active" : ""}`}
            onClick={() => onTag(tag.id)}
          >
            {t?.[tag.id] || tag.label}
          </button>
        ))}
      </div>
      <select className="mp-sort" value={sortBy} onChange={(e) => onSort(e.target.value)}>
        <option value="default">{t?.standart || "Standart tartib"}</option>
        <option value="narx_asc">{t?.narx_asc || "Narx: past → yuqori"}</option>
        <option value="narx_desc">{t?.narx_desc || "Narx: yuqori → past"}</option>
        <option value="reyting">{t?.reyting_sort || "Reyting bo'yicha"}</option>
      </select>
    </div>
  );
}
