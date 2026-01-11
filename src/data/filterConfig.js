export const FILTER_CONFIG = {
  // 1. GLOBAL FILTERS (Appear on all pages)
  global: [
    {
      id: "price",
      label: "Price Range",
      type: "range",
      min: 0,
      max: 50000,
      step: 500
    },
    {
      id: "purpose",
      label: "Shop By Purpose",
      type: "checkbox",
      options: ["Wealth", "Health", "Protection", "Marriage", "Education", "Peace", "Success"]
    }
  ],

  // 2. CATEGORY SPECIFIC FILTERS
  categories: {
    "Rudraksha": [
      {
        id: "mukhi", // Matches the key in your products.json
        label: "Mukhi (Face)",
        type: "checkbox",
        options: ["1 Mukhi", "2 Mukhi", "3 Mukhi", "4 Mukhi", "5 Mukhi", "6 Mukhi", "7 Mukhi", "Gauri Shankar", "Ganesha"]
      },
      {
        id: "origin",
        label: "Origin",
        type: "checkbox",
        options: ["Nepal", "Java (Indonesia)", "India"]
      },
      {
        id: "certification",
        label: "Certification",
        type: "checkbox",
        options: ["Lab Certified", "Premium Grade"]
      }
    ],
    "Gemstones": [
      {
        id: "planet",
        label: "Ruling Planet",
        type: "checkbox",
        options: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
      },
      {
        id: "weight",
        label: "Carat / Ratti",
        type: "checkbox",
        options: ["Below 3 Ratti", "3-5 Ratti", "5-8 Ratti", "Above 8 Ratti"]
      }
    ],
    "Mala": [
      {
        id: "material",
        label: "Material",
        type: "checkbox",
        options: ["Rudraksha", "Sandalwood", "Tulsi", "Crystal", "Lotus Seed"]
      },
      {
        id: "beadSize",
        label: "Bead Size",
        type: "checkbox",
        options: ["6mm", "8mm", "10mm", "12mm"]
      }
    ],
    "Bracelets": [
      {
        id: "material",
        label: "Material",
        type: "checkbox",
        options: ["Crystal", "Rudraksha", "Pyrite", "Seven Chakra", "Copper"]
      },
      {
        id: "gender",
        label: "Gender",
        type: "checkbox",
        options: ["Men", "Women", "Unisex"]
      }
    ]
  }
};