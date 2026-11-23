export interface PartnerEstate {
  slug: string;
  name: string;
  country: string;
  region: string;
  elevation: string;
  harvestWindow: string;
  varietals: string;
  processSignature: string;
  story: string;
  linkedCoffeeSlug: string;
  coordinates: string;
  photoUrl: string;
}

export interface ConduitPillar {
  step: string;
  title: string;
  metric: string;
  detail: string;
}

export interface MasterBarista {
  name: string;
  role: string;
  accolade: string;
  specialty: string;
  favoriteSlug: string;
  recipeNote: string;
  initials: string;
}

export const CONDUIT_PILLARS: ConduitPillar[] = [
  {
    step: '01',
    title: 'Micro-Lot Direct Trade (100% Traceable)',
    metric: 'FOB +42% ABOVE C-MARKET',
    detail:
      'Every lot is contracted directly with washing stations and smallholder cooperatives at harvest, guaranteeing farm-gate transparency and multi-year agronomic investment.',
  },
  {
    step: '02',
    title: 'Cast-Iron Drum Thermodynamics',
    metric: '204.5°C // AGTRON 58–72',
    detail:
      'Our modified 15kg cast-iron roaster balances conductive drum heat with precise convective airflow—caramelizing Maillard precursors without scorching fragile floral esters.',
  },
  {
    step: '03',
    title: 'Custom Remineralized Water (75ppm)',
    metric: '75 PPM TDS // GH 45 / KH 30',
    detail:
      'Coffee is 98.5% water. We strip municipal tap via reverse osmosis and rebuild balanced magnesium and bicarbonate buffers tailored separately for espresso and filter.',
  },
  {
    step: '04',
    title: 'Daily Refractometer & Sensory Calibration',
    metric: '20.8% – 22.4% EXTRACTION YIELD',
    detail:
      'Before doors open at 07:00, our sensory team dials every hopper using optical refractometers and blind triangle cupping tables so every cup hits peak sweetness.',
  },
];

export const PARTNER_ESTATES: PartnerEstate[] = [
  {
    slug: 'yirgacheffe-konga',
    name: 'Yirgacheffe Konga Co-op',
    country: 'Ethiopia',
    region: 'Gedeb & Yirgacheffe',
    elevation: '1,950m – 2,150m ASL',
    harvestWindow: 'November – January',
    varietals: 'Indigenous Heirloom, 74110, 74112',
    processSignature: '72h Spring-Water Washed & 21-Day Raised Beds',
    story:
      'Situated beneath ancient Birbira shade canopy trees, Konga’s 1,400 smallholder families hand-select only deep crimson cherries over 20° Brix sweetness.',
    linkedCoffeeSlug: 'hario-v60-yirgacheffe',
    coordinates: '6.1620° N, 38.2058° E',
    photoUrl: '/images/farm-mountains.jpg',
  },
  {
    slug: 'boquete-esmeralda',
    name: 'Boquete Hacienda Esmeralda',
    country: 'Panama',
    region: 'Volcán Barú, Chiriquí',
    elevation: '1,850m – 1,980m ASL',
    harvestWindow: 'January – March',
    varietals: 'Green-Tip Geisha',
    processSignature: 'Precision Temperature-Controlled Washed Micro-Lots',
    story:
      'Swept by crisp Pacific and Caribbean cross-winds on volcanic soil, these high-elevation Geisha trees produce crystalline jasmine and bergamot aromatics.',
    linkedCoffeeSlug: 'chemex-panama-geisha',
    coordinates: '8.7764° N, 82.4328° W',
    photoUrl: '/images/farm-landscape.jpg',
  },
  {
    slug: 'huila-monteblanco',
    name: 'Huila Finca Monteblanco',
    country: 'Colombia',
    region: 'Acevedo, Southern Huila',
    elevation: '1,780m – 1,920m ASL',
    harvestWindow: 'May – July & Oct – Dec',
    varietals: 'Pink Bourbon, Caturra, Castillo',
    processSignature: '72-Hour Sealed Tank Anaerobic Washed',
    story:
      'Fourth-generation grower Rodrigo Sanchez cultivates rare Pink Bourbon lineages with microbial fermentation starter cultures for vibrant guava clarity.',
    linkedCoffeeSlug: 'kalita-wave-pink-bourbon',
    coordinates: '1.8350° N, 75.8914° W',
    photoUrl: '/images/cherries.jpg',
  },
  {
    slug: 'nyeri-othaya',
    name: 'Nyeri Othaya Cooperative',
    country: 'Kenya',
    region: 'Mount Kenya Southern Slope',
    elevation: '1,880m – 1,980m ASL',
    harvestWindow: 'November – January',
    varietals: 'SL28, SL34, Ruiru 11',
    processSignature: 'Classic Kenyan 48h Double Fermentation + Conditioning',
    story:
      'Mineral-rich red Kikuyu volcanic clay yields intense phosphoric acidity, crisp blackcurrant cordial, and unmistakable savory-sweet juiciness.',
    linkedCoffeeSlug: 'aeropress-kenya-nyeri',
    coordinates: '0.5476° S, 36.9422° E',
    photoUrl: '/images/farm-kenya.jpg',
  },
  {
    slug: 'tarrazu-la-minita',
    name: 'Tarrazú La Minita Estate',
    country: 'Costa Rica',
    region: 'San Marcos de Tarrazú',
    elevation: '1,750m – 1,850m ASL',
    harvestWindow: 'December – February',
    varietals: 'Caturra, Villa Sarchí, Catuai',
    processSignature: 'Red & Yellow Honey Mucilage Drying',
    story:
      'Leaving golden mucilage intact during mechanical demucilaging creates a slow sun-curing glaze of toasted pecan, butterscotch, and apricot.',
    linkedCoffeeSlug: 'velvet-flat-white',
    coordinates: '9.6602° N, 84.0205° W',
    photoUrl: '/images/drying.jpg',
  },
  {
    slug: 'uji-kyoto-heritage',
    name: 'Uji Kyoto Heritage Tea Garden',
    country: 'Japan',
    region: 'Uji River Valley, Kyoto',
    elevation: '280m – 420m ASL',
    harvestWindow: 'First Flush — May',
    varietals: 'Samidori & Okumidori Tencha',
    processSignature: '28-Day Reed Shade + Granite Stone Mill',
    story:
      'Hand-picked first-flush shade-grown tea leaves ground slowly on carved granite wheels at 40g/hour to pair seamlessly with our espresso.',
    linkedCoffeeSlug: 'uji-dirty-matcha-espresso',
    coordinates: '34.8842° N, 135.7995° E',
    photoUrl: '/images/matcha-latte.jpg',
  },
];

export const MASTER_BARISTAS: MasterBarista[] = [
  {
    name: 'Elena Vance',
    role: 'Head Roaster & Q-Grader',
    accolade: '2x National Roasting Finalist',
    specialty: 'Cast-Iron Heat Transfer & Geisha Profiling',
    favoriteSlug: 'chemex-panama-geisha',
    recipeNote: 'Drops first crack at 198.2°C with a 13.5% development time ratio for crystalline floral clarity.',
    initials: 'EV',
  },
  {
    name: 'Mateo Morales',
    role: 'Lead Barista & Extraction Architect',
    accolade: 'World Espresso Calibration Judge',
    specialty: 'Pressure Profiling & 9-Bar Emulsions',
    favoriteSlug: 'doppio-obsidian-espresso',
    recipeNote: 'Runs a 7-second 2.5-bar bloom followed by a tapered 9-to-6.5-bar decline at 93.5°C.',
    initials: 'MM',
  },
  {
    name: 'Kenji Takahashi',
    role: 'Sensory Lab Director & Kyoto Drip Master',
    accolade: 'Syphon & Botanical Mixology Champion',
    specialty: 'Halogen Syphon & 18h Cold Towers',
    favoriteSlug: 'yuzu-botanical-espresso-tonic',
    recipeNote: 'Calibrates Kyoto drip valves to 45 drops per minute and customizes 75ppm magnesium water buffers.',
    initials: 'KT',
  },
];
