import { StudioContent } from "./types";

export const defaultContent: StudioContent = {
  details: {
    name: "DT Dreamy Tales Studio",
    owner: "Gyanu Verma",
    phone: "+91 8368914755",
    email: "dreamytalesstudio@gmail.com",
    instagram: "@dreamytalesstudio",
    location: "Greater Noida / Delhi NCR",
    msme: "MSME Registered",
    experience: "5+ Years",
  },
  hero: {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-and-flowers-40011-large.mp4",
    headline: "DT Dreamy Tales Studio",
    subHeadline: "Capturing Your Moments, Creating Timeless Stories",
  },
  about: {
    storyHeadline: "Stories That Feel Like Home",
    storyDescription: "We don't just click pictures; we weave emotions, laughter, and timeless tears into beautiful stories. Led by Gyanu Verma with 5+ years of rich storytelling experience.",
    storyParagraphs: [
      "Our Journey: Founded out of sheer passion for preservation, DT Dreamy Tales Studio has grown into an elite team of artistic photographers and cinematographers serving Delhi NCR and beyond.",
      "Our Approach: We believe in candid, unposed magic. By blending into your wedding as friends rather than vendors, we capture the silent sighs, the ecstatic laughter, and the authentic family love that standard photos miss.",
      "Our Promise: To treat every frame as an archival piece of art. Handcrafted album layouts, meticulously color-graded cinematic films, and memories that retain their warmth for generations.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200",
    philosophyBgUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600",
    philosophySlides: [
      {
        "id": "p-slide-1",
        "imageUrl": "/uploads/T_S_Wed_1.jpg",
        "title": "THE REGAL UNION"
      },
      {
        "id": "p-slide-2",
        "imageUrl": "/uploads/T_S_Wed_2.jpg",
        "title": "GOLDEN HOUR LOVE"
      },
      {
        "id": "p-slide-3",
        "imageUrl": "/uploads/T_S_Wed_3.jpg",
        "title": "CANDID WHISPERS"
      },
      {
        "id": "p-slide-4",
        "imageUrl": "/uploads/T_S_Wed_4.jpg",
        "title": "THE ROYAL EMBRACE"
      },
      {
        "id": "p-slide-5",
        "imageUrl": "/uploads/T_S_Wed_5.jpg",
        "title": "ARCHITECTURAL GLANCE"
      },
      {
        "id": "p-slide-6",
        "imageUrl": "/uploads/T_S_Wed_6.jpg",
        "title": "ETERNAL CHEMISTRY"
      },
      {
        "id": "p-slide-7",
        "imageUrl": "/uploads/T_S_Wed_7.jpg",
        "title": "SILENT CHEMISTRY"
      },
      {
        "id": "p-slide-8",
        "imageUrl": "/uploads/T_S_Wed_8.jpg",
        "title": "NUPTIAL HAPPINESS"
      }
    ]
  },
  stats: {
    weddings: 100,
    couples: 150,
    events: 200,
    backgroundUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=2000",
  },
  services: [
    {
      id: "srv-1",
      title: "Wedding Photography",
      description: "Full-scale coverage of your auspicious rituals, featuring elegant custom portraitures and artistic capture of key milestones.",
      startingPrice: "₹45,000",
      features: ["Traditional & Candid blend", "High-res color-corrected photos", "Digital gallery delivery", "Premium printed album"],
      icon: "Camera",
    },
    {
      id: "srv-2",
      title: "Candid Photography",
      description: "Documenting raw, authentic, unscripted emotions, secret glances, and joyous tears in journalistic style.",
      startingPrice: "₹35,000",
      features: ["Exclusively non-posed shots", "Dedicated candid photo artist", "Stunning cinematic grade", "Unlimited emotional moments"],
      icon: "Sparkles",
    },
    {
      id: "srv-3",
      title: "Pre-Wedding Shoot",
      description: "A gorgeous, stylized photoshoot at handpicked scenic locations to capture your anticipation and intimate chemistry before the big day.",
      startingPrice: "₹25,000",
      features: ["Creative conceptual styling", "Drone or cinematic frames", "15 edited master portraits", "Beautiful teaser slideshow video"],
      icon: "Heart",
    },
    {
      id: "srv-4",
      title: "Cinematic Videography",
      description: "High-end cinematic wedding films that look and feel like movie masterpieces, crafted with top-tier narrative editing and custom music scores.",
      startingPrice: "₹65,000",
      features: ["Multi-camera custom cinematography", "4K resolution master exports", "3-5 mins highlight teaser", "Full ceremony documentary"],
      icon: "Film",
    },
    {
      id: "srv-5",
      title: "Album Designing",
      description: "Bespoke lay-flat premium coffee table albums printed on fine-art archival paper, individually curated and laid out by expert designers.",
      startingPrice: "₹15,000",
      features: ["Archival non-fade paper", "Custom elegant leather or linen cover", "Up to 150 selected photos", "Lay-flat modern seamless binding"],
      icon: "BookOpen",
    },
  ],
  portfolio: [
    {
      id: "p-1",
      title: "Serenade of Sunset",
      category: "Pre-Wedding",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-2",
      title: "The Golden Vows",
      category: "Cinematic",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-40012-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "p-3",
      title: "Royal Crimson Elegance",
      category: "Photography",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-4",
      title: "Baraat Grandeur & Celebration",
      category: "Films",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-by-the-lake-at-sunset-40009-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "p-5",
      title: "Archway Whispers",
      category: "Candid",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-6",
      title: "Joyous Nuptial Bliss",
      category: "Candid",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-7",
      title: "Unconditional Laughter",
      category: "Films",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-groomsman-putting-on-his-jacket-40008-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      clientName: "Krishna & Omar",
      images: [
        "https://images.unsplash.com/photo-1621616875450-79f22448040e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
      ],
      text: "During the early days of our wedding planning, someone advised us to hire a photographer we like as a person because we will spend a lot of time with them. Aside from being absurdly good photographers, the team at Dreamy Tales quickly became our friends, our personal assistants, and even our firefighters when something didn't go as planned. They kept our energy up during long days, they moved with empathy, and they made it so easy for us to be ourselves in front of the camera. Our families and friends had a blast with them around, and because of their amazing energy, people felt so comfortable moving freely, even when they knew a camera was pointed their way."
    },
    {
      id: "rev-2",
      clientName: "Aditi Singh",
      images: [
        "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800"
      ],
      text: "Had a great experience. Very professional team and excellent quality of work. Everything was delivered on time. Highly recommended!"
    },
    {
      id: "rev-3",
      clientName: "Avanti Goyal",
      images: [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800"
      ],
      text: "A genuinely talented and professional team. Their work stands out because they don't just capture visuals, they capture emotions and atmosphere really beautifully. The turnaround, communication, and overall experience always seem incredibly smooth and well-managed. Highly recommend them."
    },
    {
      id: "rev-4",
      clientName: "Jyoti Kaushik",
      images: [
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800"
      ],
      text: "We had a great experience with Dreamy Tales Studio, as they covered my brother's engagement and wedding beautifully. From start to finish, their team was incredibly professional, friendly, and attentive to every little detail. Their creativity, timing, and dedication clearly reflect in their work."
    },
    {
      id: "rev-5",
      clientName: "Prabodkh Balyan",
      images: [
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc35953?auto=format&fit=crop&q=80&w=800"
      ],
      text: "Photos are very good. I will let you know about the photos for editing in few days as I am in Guwahati right now. Very professional. 👍"
    },
    {
      id: "rev-6",
      clientName: "Adv Shashwat Raj",
      images: [
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21a?auto=format&fit=crop&q=80&w=800"
      ],
      text: "Kya khatarnaak video banaye hai. Aapke haath me jadu hai. Achi lagi. Thank you so much for your kind words and encouragement, Bhai Ji. Your appreciation means a lot to us and gives us even more motivation to keep working hard and delivering our best. We truly value your support."
    }
  ],
};
