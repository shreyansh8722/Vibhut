export const CATEGORY_CONFIG = {
  "Rudraksha": {
    heroImage: "https://images.unsplash.com/photo-1620320677595-6ee8b0b82fb3?q=80&w=2670&auto=format&fit=crop", 
    title: "Sacred Rudraksha Beads",
    description: "The tear of Lord Shiva. Authentic, lab-certified beads for protection and power.",
    // THESE ARE THE FILTERS THAT WILL APPEAR AUTOMATICALLY
    subCategories: [
      {
        heading: "Filter by Mukhi",
        filterKey: "mukhi", // Ensure your product.json has this key (e.g. "mukhi": "5 Mukhi")
        options: ["1 Mukhi", "2 Mukhi", "3 Mukhi", "4 Mukhi", "5 Mukhi", "6 Mukhi", "7 Mukhi", "8 Mukhi", "9 Mukhi", "10 Mukhi", "11 Mukhi", "12 Mukhi", "13 Mukhi", "14 Mukhi", "Gauri Shankar", "Ganesha"]
      },
      {
        heading: "Type",
        filterKey: "type",
        options: ["Bead", "Mala", "Bracelet", "Siddha Mala"]
      },
      {
        heading: "Origin",
        filterKey: "origin",
        options: ["Nepal", "Java", "India"]
      }
    ]
  },
  "Gemstones": {
    heroImage: "https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=2670&auto=format&fit=crop",
    title: "Vedic Gemstones",
    description: "Natural, untreated gemstones energized to amplify your ruling planets.",
    subCategories: [
      {
        heading: "Filter by Stone",
        filterKey: "stone",
        options: ["Pukhraj", "Neelam", "Ruby", "Emerald", "Moonga", "Pearl", "Opal"]
      },
      {
        heading: "Metal",
        filterKey: "metal",
        options: ["Gold", "Silver", "Panchdhatu"]
      }
    ]
  },
  "default": {
    heroImage: "https://images.unsplash.com/photo-1596759714249-5f2b84d41029?q=80&w=2670&auto=format&fit=crop",
    title: "Divine Collection",
    description: "Explore our complete range of spiritual artifacts.",
    subCategories: []
  }
};