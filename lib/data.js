export const CATEGORY_MAP = {
  tech: {
    label: "Technology",
    icon: "💻",
    description: "Tech meetups, hackathons, and developer conferences",
  },
  music: {
    label: "Music",
    icon: "🎵",
    description: "Concerts, festivals, and live performances",
  },
  sports: {
    label: "Sports",
    icon: "⚽",
    description: "Sports events, tournaments, and fitness activities",
  },
  art: {
    label: "Art & Culture",
    icon: "🎨",
    description: "Art exhibitions, cultural events, and creative workshops",
  },
  food: {
    label: "Food & Drink",
    icon: "🍕",
    description: "Food festivals, cooking classes, and culinary experiences",
  },
  business: {
    label: "Business",
    icon: "💼",
    description: "Networking events, conferences, and startup meetups",
  },
  health: {
    label: "Health & Wellness",
    icon: "🧘",
    description: "Yoga, meditation, wellness workshops, and health seminars",
  },
  education: {
    label: "Education",
    icon: "📚",
    description: "Workshops, seminars, and learning experiences",
  },
  gaming: {
    label: "Gaming",
    icon: "🎮",
    description: "Gaming tournaments, esports, and gaming conventions",
  },
  networking: {
    label: "Networking",
    icon: "🤝",
    description: "Professional networking and community building events",
  },
  outdoor: {
    label: "Outdoor & Adventure",
    icon: "🏕️",
    description: "Hiking, camping, and outdoor activities",
  },
  community: {
    label: "Community",
    icon: "👥",
    description: "Local community gatherings and social events",
  },
};

export const CATEGORIES = Object.entries(CATEGORY_MAP).map(([id, data]) => ({
  id,
  ...data,
}));

export const getCategoryById = (id) => CATEGORY_MAP[id] || null;
export const getCategoryLabel = (id) => CATEGORY_MAP[id]?.label ?? id;
export const getCategoryIcon = (id) => CATEGORY_MAP[id]?.icon ?? "📅";
