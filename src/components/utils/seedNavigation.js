import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../lib/firebase"; // Adjust path if needed

export const uploadNavItems = async () => {
  const NAV_ITEMS = [
    { 
      id: 'sarees',
      name: 'Sarees', 
      link: '/shop?cat=saree',
      order: 1,
      image: 'https://images.unsplash.com/photo-1610189012906-47833d772097?w=500&q=80',
      subCategories: [
        { name: 'Banarasi Silk', link: '/shop?cat=saree&type=silk' },
        { name: 'Katan Silk', link: '/shop?cat=saree&type=katan' },
        { name: 'Georgette', link: '/shop?cat=saree&type=georgette' },
        { name: 'Organza', link: '/shop?cat=saree&type=organza' },
      ]
    },
    { 
      id: 'lehengas',
      name: 'Lehengas', 
      link: '/shop?cat=lehenga',
      order: 2,
      image: 'https://images.unsplash.com/photo-1583391726247-e29237d8612f?w=500&q=80',
      subCategories: [
        { name: 'Bridal', link: '/shop?cat=lehenga&type=bridal' },
        { name: 'Party Wear', link: '/shop?cat=lehenga&type=party' },
        { name: 'Traditional', link: '/shop?cat=lehenga&type=traditional' },
      ]
    },
    { 
      id: 'suits',
      name: 'Suits', 
      link: '/shop?cat=suit',
      order: 3,
      image: 'https://images.unsplash.com/photo-1605902394263-66869c466503?w=500&q=80',
      subCategories: [
        { name: 'Unstitched Suits', link: '/shop?cat=suit&type=unstitched' },
        { name: 'Ready to Wear', link: '/shop?cat=suit&type=ready' },
        { name: 'Silk Suits', link: '/shop?cat=suit&type=silk' },
      ]
    },
    { 
      id: 'dupattas',
      name: 'Dupattas', 
      link: '/shop?cat=dupatta',
      order: 4,
      image: 'https://images.unsplash.com/photo-1621623194266-4b3664963684?w=500&q=80',
      subCategories: [
        { name: 'Banarasi Dupatta', link: '/shop?cat=dupatta&type=banarasi' },
        { name: 'Silk Dupatta', link: '/shop?cat=dupatta&type=silk' },
        { name: 'Bridal Odhani', link: '/shop?cat=dupatta&type=bridal' },
      ]
    },
  ];

  try {
    console.log("Starting navigation upload...");
    for (const item of NAV_ITEMS) {
      await setDoc(doc(db, "navigation", item.id), item);
    }
    console.log("✅ Navigation uploaded successfully! You can now remove the import.");
  } catch (error) {
    console.error("❌ Error uploading navigation:", error);
  }
};

// Auto-execute if imported
uploadNavItems();