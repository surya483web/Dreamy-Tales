export interface StudioDetails {
  name: string;
  owner: string;
  phone: string;
  email: string;
  instagram: string;
  location: string;
  msme: string;
  experience: string;
}

export interface HeroSection {
  videoUrl: string;
  headline: string;
  subHeadline: string;
}

export interface PhilosophySlide {
  id: string;
  imageUrl: string;
  title: string;
}

export interface AboutSection {
  storyHeadline: string;
  storyDescription: string;
  storyParagraphs: string[];
  photoUrl: string;
  philosophySlides?: PhilosophySlide[];
  philosophyBgUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Photography' | 'Films' | 'Pre-Wedding' | 'Candid' | 'Cinematic';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnail?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  features: string[];
  icon: string;
}

export interface Inquiry {
  id: string;
  clientName: string;
  partnerName?: string;
  eventType: string;
  eventDate: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'read';
  createdAt: string;
}

export interface ClientReview {
  id: string;
  clientName: string;
  images: string[];
  text: string;
}

export interface StudioContent {
  details: StudioDetails;
  hero: HeroSection;
  about: AboutSection;
  portfolio: PortfolioItem[];
  services: ServiceItem[];
  stats: {
    weddings: number;
    couples: number;
    events: number;
    backgroundUrl?: string;
  };
  reviews?: ClientReview[];
  philosophy_catalog?: string[];
}
