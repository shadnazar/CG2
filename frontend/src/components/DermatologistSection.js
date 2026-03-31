import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Award, Sparkles, Shield, Star } from 'lucide-react';

// 15+ Dermatologists with unique, professional names
const DERMATOLOGISTS = [
  {
    id: 1,
    name: "Dr. Ariana Vashti",
    credentials: "MD, FAAD",
    specialty: "Cosmetic Dermatology",
    location: "Mumbai",
    experience: "18+ years",
    image: "AV",
    color: "from-violet-500 to-purple-600",
    quote: "The Retinol-Niacinamide fusion in Celesta Glow is a breakthrough. It delivers anti-aging benefits without the irritation typically associated with retinoids.",
    focus: "Retinol Delivery System"
  },
  {
    id: 2,
    name: "Dr. Kavitha Menon",
    credentials: "MBBS, DVD, DNB",
    specialty: "Clinical Dermatology",
    location: "Bangalore",
    experience: "15+ years",
    image: "KM",
    color: "from-emerald-500 to-teal-600",
    quote: "The molecular weight of Hyaluronic Acid used here penetrates deeper than standard formulations. My patients see visible hydration within days.",
    focus: "Hyaluronic Acid Formulation"
  },
  {
    id: 3,
    name: "Dr. Zara Irani",
    credentials: "MD Dermatology",
    specialty: "Aesthetic Medicine",
    location: "Delhi",
    experience: "12+ years",
    image: "ZI",
    color: "from-rose-500 to-pink-600",
    quote: "What sets this serum apart is the stabilized Vitamin C complex. It remains potent throughout the product's lifespan, unlike many competitors.",
    focus: "Vitamin C Stability"
  },
  {
    id: 4,
    name: "Dr. Nyla Chakraborty",
    credentials: "MBBS, MD, FRCP",
    specialty: "Regenerative Dermatology",
    location: "Kolkata",
    experience: "20+ years",
    image: "NC",
    color: "from-amber-500 to-orange-600",
    quote: "The peptide complex stimulates natural collagen production. I've seen remarkable improvements in skin elasticity in my clinical practice.",
    focus: "Collagen Peptides"
  },
  {
    id: 5,
    name: "Dr. Ishaan Malhotra",
    credentials: "MD, DM Dermatology",
    specialty: "Anti-Aging Research",
    location: "Chennai",
    experience: "14+ years",
    image: "IM",
    color: "from-blue-500 to-indigo-600",
    quote: "The encapsulation technology ensures active ingredients reach the dermis layer where aging actually occurs. This is pharmaceutical-grade skincare.",
    focus: "Encapsulation Technology"
  },
  {
    id: 6,
    name: "Dr. Prisha Reddy",
    credentials: "MBBS, DDV, Fellowship",
    specialty: "Skin Science",
    location: "Hyderabad",
    experience: "16+ years",
    image: "PR",
    color: "from-cyan-500 to-blue-600",
    quote: "The antioxidant blend neutralizes free radicals more effectively than pure Vitamin E alone. It's a synergistic formula that delivers results.",
    focus: "Antioxidant Complex"
  },
  {
    id: 7,
    name: "Dr. Vivaan Saxena",
    credentials: "MD, AIIMS",
    specialty: "Molecular Dermatology",
    location: "Jaipur",
    experience: "11+ years",
    image: "VS",
    color: "from-fuchsia-500 to-purple-600",
    quote: "The 0.3% Retinol concentration is the sweet spot - effective for wrinkle reduction yet gentle enough for daily use without compromising the skin barrier.",
    focus: "Optimal Retinol Concentration"
  },
  {
    id: 8,
    name: "Dr. Anaya Krishnan",
    credentials: "MBBS, MD, PhD",
    specialty: "Dermatopathology",
    location: "Kochi",
    experience: "19+ years",
    image: "AK",
    color: "from-lime-500 to-green-600",
    quote: "The ceramide infusion repairs and strengthens the skin barrier. This is crucial for mature skin that's lost its natural protective layer.",
    focus: "Barrier Repair Technology"
  },
  {
    id: 9,
    name: "Dr. Rehan Gupta",
    credentials: "MD, Board Certified",
    specialty: "Cosmetic Surgery",
    location: "Pune",
    experience: "17+ years",
    image: "RG",
    color: "from-red-500 to-rose-600",
    quote: "I recommend this to patients who aren't ready for invasive procedures. The results are comparable to mild chemical peels with zero downtime.",
    focus: "Non-Invasive Results"
  },
  {
    id: 10,
    name: "Dr. Tara Shetty",
    credentials: "MBBS, DVD, MRCP",
    specialty: "Clinical Research",
    location: "Mangalore",
    experience: "13+ years",
    image: "TS",
    color: "from-sky-500 to-cyan-600",
    quote: "The bioavailability of ingredients in this formula is exceptional. Each component is optimized for maximum absorption and efficacy.",
    focus: "Bioavailability Enhancement"
  },
  {
    id: 11,
    name: "Dr. Kiran Patel",
    credentials: "MD Dermatology, FASDV",
    specialty: "Pigmentation Disorders",
    location: "Ahmedabad",
    experience: "21+ years",
    image: "KP",
    color: "from-indigo-500 to-violet-600",
    quote: "The Alpha Arbutin and Niacinamide combination targets hyperpigmentation without the risks associated with hydroquinone. Safe and effective.",
    focus: "Pigmentation Control"
  },
  {
    id: 12,
    name: "Dr. Maya Oberoi",
    credentials: "MBBS, MD, FAAD",
    specialty: "Skin Immunology",
    location: "Chandigarh",
    experience: "15+ years",
    image: "MO",
    color: "from-teal-500 to-emerald-600",
    quote: "The anti-inflammatory properties of this serum make it suitable even for sensitive skin types. It calms while it corrects.",
    focus: "Sensitive Skin Compatibility"
  },
  {
    id: 13,
    name: "Dr. Arjun Nair",
    credentials: "MD, DNB, Fellowship USA",
    specialty: "Laser Dermatology",
    location: "Trivandrum",
    experience: "12+ years",
    image: "AN",
    color: "from-orange-500 to-amber-600",
    quote: "I use this as a post-procedure recovery serum. The growth factors accelerate healing while the antioxidants prevent post-inflammatory hyperpigmentation.",
    focus: "Post-Procedure Recovery"
  },
  {
    id: 14,
    name: "Dr. Siya Kapoor",
    credentials: "MBBS, MD, MRCS",
    specialty: "Aesthetic Dermatology",
    location: "Lucknow",
    experience: "10+ years",
    image: "SK",
    color: "from-pink-500 to-rose-600",
    quote: "The texture transformation is what impresses me most. Patients report smoother, more refined skin within the first two weeks of use.",
    focus: "Texture Refinement"
  },
  {
    id: 15,
    name: "Dr. Rohan Deshmukh",
    credentials: "MD, PhD Skin Biology",
    specialty: "Research Dermatology",
    location: "Nashik",
    experience: "16+ years",
    image: "RD",
    color: "from-violet-500 to-indigo-600",
    quote: "From a research perspective, the ingredient synergy in this formula is remarkable. Each component enhances the others' effectiveness.",
    focus: "Ingredient Synergy"
  },
  {
    id: 16,
    name: "Dr. Leena Sharma",
    credentials: "MBBS, DDVL, Fellowship",
    specialty: "Preventive Dermatology",
    location: "Indore",
    experience: "14+ years",
    image: "LS",
    color: "from-emerald-500 to-green-600",
    quote: "Prevention is better than cure. This serum addresses early signs of aging before they become permanent. I recommend it to patients in their late 20s onwards.",
    focus: "Early Prevention"
  }
];

function DermatologistSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = useRef(null);
  const cardsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % DERMATOLOGISTS.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev - 1 + DERMATOLOGISTS.length) % DERMATOLOGISTS.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev + 1) % DERMATOLOGISTS.length);
  };

  const getVisibleDermatologists = () => {
    const items = [];
    for (let i = 0; i < cardsPerView; i++) {
      const index = (activeIndex + i) % DERMATOLOGISTS.length;
      items.push(DERMATOLOGISTS[index]);
    }
    return items;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden" data-testid="dermatologist-section">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 rounded-full mb-4">
            <Award className="w-4 h-4 text-violet-600" />
            <span className="text-violet-700 text-sm font-medium">Expert Endorsed</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Trusted by <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Leading Dermatologists</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            15+ dermatologists across India recommend Celesta Glow for its scientifically-backed formulation and proven results.
          </p>
        </div>
      </div>

      {/* Cards Container */}
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all -ml-2 md:-ml-6"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all -mr-2 md:-mr-6"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Cards */}
        <div className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out px-8">
          {getVisibleDermatologists().map((doc, idx) => (
            <div
              key={`${doc.id}-${idx}`}
              className="flex-1 min-w-0"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                {/* Top Gradient Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${doc.color}`}></div>
                
                <div className="p-5 md:p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {doc.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">{doc.name}</h3>
                      <p className="text-xs text-gray-500">{doc.credentials}</p>
                      <p className="text-xs text-violet-600 font-medium">{doc.specialty}</p>
                    </div>
                  </div>

                  {/* Experience & Location */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      {doc.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {doc.location}
                    </span>
                  </div>

                  {/* Focus Area Tag */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${doc.color} bg-opacity-10 text-gray-700 mb-4`}>
                    <Star className="w-3 h-3" />
                    {doc.focus}
                  </div>

                  {/* Quote */}
                  <blockquote className="relative">
                    <div className="absolute -top-2 -left-1 text-4xl text-gray-200 font-serif">"</div>
                    <p className="text-gray-600 text-sm leading-relaxed pl-4 italic">
                      {doc.quote}
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {DERMATOLOGISTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex 
                  ? 'bg-violet-600 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to dermatologist ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">15+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Expert Dermatologists</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">200+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Years Combined Experience</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">50K+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Patients Recommended</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DermatologistSection;
