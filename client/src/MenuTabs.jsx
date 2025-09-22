import React, { useState, useEffect } from "react";

function MenuTabs() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeGroup, setActiveGroup] = useState("");
  const [priceGroups, setPriceGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch items from backend API
  useEffect(() => {
    fetch("http://localhost:5000/api/products") // replace with your API URL
      .then((res) => res.json())
      .then((data) => {
        setItems(data);

        // Set unique price groups and categories
        const groups = [...new Set(data.map((item) => item.price_group))];
        setPriceGroups(groups);
        if (groups.length > 0) setActiveGroup(groups[0]);

        const cats = [...new Set(data.map((item) => item.category))];
        setCategories(cats);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch items:", err);
        setLoading(false);
      });
  }, []);

  // Handle inline price edit
  const handlePriceChange = (plu_number, value) => {
    setEditing((prev) => ({ ...prev, [plu_number]: value }));
  };

  const savePrice = (plu_number) => {
    const updatedPrice = parseFloat(editing[plu_number]);

    fetch(`http://localhost:5000/api/products/${plu_number}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: updatedPrice }),
    })
      .then((res) => res.json())
      .then(() => {
        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.plu_number === plu_number ? { ...item, price: updatedPrice } : item
          )
        );
        // Clear editing
        setEditing((prev) => {
          const copy = { ...prev };
          delete copy[plu_number];
          return copy;
        });
      })
      .catch((err) => console.error("Failed to save price:", err));
  };

  // Filtered items based on tab, search, and category
  const filteredItems = items.filter((item) => {
    const matchesGroup = item.price_group === activeGroup;
    const matchesSearch =
      item.plu_number.includes(search) ||
      item.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesGroup && matchesSearch && matchesCategory;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Product Pricing</h1>

      {/* Tabs for Price Groups */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        {priceGroups.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            style={{
              marginRight: "1rem",
              padding: "0.5rem 1rem",
              background: activeGroup === group ? "#007bff" : "#f0f0f0",
              color: activeGroup === group ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Search + Category Filter */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by PLU or Product Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem", width: "250px" }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>PLU</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Product Name</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Category</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Price</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <tr key={item.plu_number} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "0.5rem" }}>{item.plu_number}</td>
                <td style={{ padding: "0.5rem" }}>{item.product_name}</td>
                <td style={{ padding: "0.5rem" }}>{item.category}</td>
                <td style={{ padding: "0.5rem" }}>
                  {editing[item.plu_number] !== undefined ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editing[item.plu_number]}
                      onChange={(e) =>
                        handlePriceChange(item.plu_number, e.target.value)
                      }
                      style={{ width: "80px" }}
                    />
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {editing[item.plu_number] !== undefined ? (
                    <button onClick={() => savePrice(item.plu_number)}>Save</button>
                  ) : (
                    <button
                      onClick={() =>
                        setEditing((prev) => ({
                          ...prev,
                          [item.plu_number]: item.price,
                        }))
                      }
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MenuTabs;