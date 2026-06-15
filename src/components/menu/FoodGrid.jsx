import React from "react";

export default function FoodGrid({ items, isBar, onAddToCart, onAddToWishlist, wishlistIds }) {
  return (
    <div className="food-grid-menu">
      {items.map((item) => {
        const isSaved = wishlistIds.includes(item.id);
        return (
          <article key={item.id} className="food-card-menu">
            <div className="food-card-img">
              <img src={item.rasm} alt={item.nomi} />
              {item.ommabop && <span className="food-card-badge">Ommabop</span>}
            </div>
            <div className="food-card-body">
              <div className="food-card-top">
                <div>
                  <h3 className="food-card-title">{item.nomi}</h3>
                  <p className="food-card-desc">{item.tavsif}</p>
                </div>
                <button
                  type="button"
                  className={`wishlist-btn ${isSaved ? "saved" : ""}`}
                  onClick={() => onAddToWishlist?.(item)}
                  aria-label={isSaved ? "Sevimlilardan olib tashlash" : "Sevimlarga qo'shish"}
                >
                  {isSaved ? "♥" : "♡"}
                </button>
              </div>
              <div className="food-card-meta">
                {item.kaloriya && <span>{item.kaloriya} kcal</span>}
                {item.vazn && <span>{item.vazn}</span>}
                {item.hajm && <span>{item.hajm}</span>}
              </div>
              <div className="food-card-footer">
                <div className="food-card-price">
                  <strong>{item.narx?.toLocaleString()}</strong>
                  <span> so'm</span>
                </div>
                <button type="button" className="food-card-add" onClick={() => onAddToCart?.(item)}>
                  Savatga
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
