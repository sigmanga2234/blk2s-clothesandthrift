import { Product } from './types';

// Import local product images generated for the collection
import imgBlueCarpenter from './assets/images/blue_carpenter_jeans_1784446902735.jpg';
import imgTanDoubleKnee from './assets/images/tan_double_knee_pants_1784446914890.jpg';
import imgBlackContrastStitch from './assets/images/black_contrast_stitch_pants_1784446927091.jpg';
import imgLightWashShorts from './assets/images/light_wash_denim_shorts_1784446943633.jpg';
import imgFrayedJorts from './assets/images/frayed_medium_jorts_1784447201341.jpg';
import imgSouthpoleJorts from './assets/images/southpole_denim_jorts_1784446955180.jpg';

// Extra individual items represented in the photos
import imgSageUtility from './assets/images/sage_utility_cargo_jeans_1784446966007.jpg';
import imgStarEmbroidered from './assets/images/star_embroidered_jeans_1784446976776.jpg';
import imgBaggyLightWash from './assets/images/baggy_light_wash_jeans_1784446988038.jpg';
import imgCharacterPocket from './assets/images/character_pocket_jeans_1784447217143.jpg';

// Bundle images representing the multi-pant sheets in the user's photos
import imgThreeJeansBundle from './assets/images/three_jeans_bundle_1784447493003.jpg';
import imgThreeSweatpantsBundle from './assets/images/three_sweatpants_bundle_1784447507138.jpg';
import imgThreeSkaterJeansBundle from './assets/images/three_skater_jeans_bundle_1784447517868.jpg';
import imgThreeFlareJeansBundle from './assets/images/three_flare_jeans_bundle_1784447530538.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'BLK2S Diagonal-Stitch Blue Carpenter Jeans',
    price: 89,
    category: 'Denim Jeans',
    image: imgBlueCarpenter,
    description: 'Authentic retro baggy-fit blue carpenter jeans in mid-weight stonewashed cotton denim. Features detailed double-pockets with diagonal stitching on the rear pockets, deep cargo tool pockets, a hammer loop, and a classic mid-wash drape.',
    size: 'L (Waist 34)',
    condition: 'Excellent',
    material: '100% Cotton Denim',
    year: '2004',
    isFeatured: true,
    reviews: [
      {
        id: 'r1',
        author: 'SkateDigger_99',
        rating: 5,
        comment: 'These are the real deal! Heavyweight, super baggy, drape perfectly over Dunks. Hard to find original carpenter hems in this condition.',
        date: '2026-07-10'
      },
      {
        id: 'r2',
        author: 'Nico.Vntg',
        rating: 5,
        comment: 'Absolutely robust denim. Stitch quality is 10/10.',
        date: '2026-07-15'
      }
    ]
  },
  {
    id: '2',
    title: 'Earth Tan Frayed Utility Work Pants',
    price: 95,
    category: 'Cargo & Utility',
    image: imgTanDoubleKnee,
    description: 'Earth tone tan heavy utility canvas work pants with iconic double-knee reinforcement panels and dual flap rear pockets. Features a beautifully faded patina with custom frayed and distressed detailing on the lower hems and pockets. True baggy workwear cut.',
    size: 'M (Waist 32)',
    condition: 'Gently Used',
    material: '100% Heavy Cotton Canvas',
    year: '1999',
    isFeatured: true,
    reviews: [
      {
        id: 'r3',
        author: 'Corey_B',
        rating: 4,
        comment: 'The hem fraying is perfect. Fabric is stiff but comfortable. True vintage feel.',
        date: '2026-06-28'
      }
    ]
  },
  {
    id: '3',
    title: 'Charcoal Black Contrast-Stitch Panelled Pants',
    price: 110,
    category: 'Cargo & Utility',
    image: imgBlackContrastStitch,
    description: 'Super rare heavyweight washed charcoal black carpenter utility pants with high-contrast bright white stitch lines. Sourced with detailed knee panels, red bar-tack details, dual side tool pockets, and robust canvas structure.',
    size: 'XL (Waist 36)',
    condition: 'Mint',
    material: 'Heavyweight Cotton Drill',
    year: '2001',
    isFeatured: true,
    reviews: [
      {
        id: 'r4',
        author: 'Dread_Archive',
        rating: 5,
        comment: 'Stiff, thick, beautiful contrast stitch. A literal archive masterpiece.',
        date: '2026-07-14'
      }
    ]
  },
  {
    id: '4',
    title: '90s Skater Light Wash Denim Jorts',
    price: 65,
    category: 'Vintage Jorts',
    image: imgLightWashShorts,
    description: 'Ultra-wide fit vintage light wash denim carpenter shorts (jorts). Sits perfectly below the knees for that authentic early 2000s skater look. Sourced with classic multi-tool pocket racks, a hammer loop, and subtle red stitch accents on the back pockets.',
    size: 'M (Waist 32)',
    condition: 'Excellent',
    material: '100% Cotton Denim',
    year: '2003',
    isFeatured: false,
    reviews: []
  },
  {
    id: '5',
    title: 'Indigo Frayed Raw-Hem Denim Jorts',
    price: 72,
    category: 'Vintage Jorts',
    image: imgFrayedJorts,
    description: 'Deep indigo wash denim carpenter shorts featuring a hand-cut raw frayed fringe hem, hammer loop, and back utility pockets. Beautifully faded denim with structured drape that pools near the calves.',
    size: 'L (Waist 34)',
    condition: 'Distressed',
    material: '100% Washed Cotton Denim',
    year: '2001',
    isFeatured: false,
    reviews: [
      {
        id: 'r8',
        author: 'Digger_X',
        rating: 4,
        comment: 'The frayed fringe hem looks amazing. Pairs nicely with chunkier runners.',
        date: '2026-07-01'
      }
    ]
  },
  {
    id: '6',
    title: 'Y2K Southpole Indigo Contrast-Stitch Jorts',
    price: 78,
    category: 'Vintage Jorts',
    image: imgSouthpoleJorts,
    description: 'Authentic Y2K Southpole baggy denim jorts in deep wash indigo. Features iconic thick white contrast stitching, oversized back pockets with embroidered branding, and the signature Southpole leather patch at the waist.',
    size: 'L (Waist 34)',
    condition: 'Mint',
    material: 'Rigid Indigo Denim',
    year: '2002',
    isFeatured: true,
    reviews: [
      {
        id: 'r5',
        author: 'Baller2000',
        rating: 5,
        comment: 'Unbelievable fit. Huge pockets and heavy-duty contrast stitching. Literally deadstock condition.',
        date: '2026-07-16'
      }
    ]
  },
  {
    id: '7',
    title: 'BLK2S Vintage Triple-Pack Denim Racks',
    price: 240,
    category: 'Curated Sets',
    image: imgThreeJeansBundle,
    description: 'Curated full catalog triple-pack featuring three essential shades: our signature heavy black carpenter jeans, a classic light wash blue denim, and a vintage dirty-wash grey-green utility pair. All feature ultra-relaxed cuts and deep pocket racks.',
    size: 'M / L Mix',
    condition: 'Mint',
    material: 'Premium Rigid Denim & Twill',
    year: '2000-2004',
    isFeatured: true,
    reviews: [
      {
        id: 'r9',
        author: 'ArchiveSpecialist',
        rating: 5,
        comment: 'This is an unbelievable value pack. All three fit incredibly baggy and hang beautifully. The green pair is a hidden gem!',
        date: '2026-07-17'
      }
    ]
  },
  {
    id: '8',
    title: 'Skater Star-Embroidered Drawstring Pants Set',
    price: 195,
    category: 'Curated Sets',
    image: imgThreeSweatpantsBundle,
    description: 'The ultimate Y2K lounge bundle. Includes three drawstring denim hybrid sweatpants: a panels-accented light wash pair, a tactical multi-pocket cargo pair, and a retro star-embroidered dark-wash sweatpant. Features elasticated comfort waistbands.',
    size: 'One Size (Waist 28-36)',
    condition: 'Excellent',
    material: 'Soft Wash Slub Denim',
    year: '2003-2005',
    isFeatured: true,
    reviews: [
      {
        id: 'r6',
        author: 'StarBoy_Archive',
        rating: 5,
        comment: 'Most comfortable pants in my closet now. The star embroidery details are insane in person!',
        date: '2026-07-18'
      }
    ]
  },
  {
    id: '9',
    title: 'BLK2S Archival Skater Light Jeans Bundle',
    price: 260,
    category: 'Curated Sets',
    image: imgThreeSkaterJeansBundle,
    description: 'A collection bundle of three iconic 90s light wash skater jeans. Curated for their heavy wear, distinctive whisker washes, roomy thigh ratios, and vintage slub textures. Ultimate skate drape that stacks perfectly.',
    size: 'L (Waist 34)',
    condition: 'Gently Used',
    material: '100% Slub Denim Cotton',
    year: '1998-2002',
    isFeatured: false,
    reviews: []
  },
  {
    id: '10',
    title: 'Archival Ultra-Wide Flare Light Jeans Set',
    price: 290,
    category: 'Curated Sets',
    image: imgThreeFlareJeansBundle,
    description: 'A selection of three legendary wide-flare light-wash denim pants. Selected for their extreme pooling drapes, custom stitching, raw frayed distress, and dramatic skater-punk silhouettes that flow beautifully as you move.',
    size: 'S / M Mix',
    condition: 'Distressed',
    material: 'Premium Selvedge Denim',
    year: '1999-2001',
    isFeatured: true,
    reviews: [
      {
        id: 'r7',
        author: 'GrailCollector',
        rating: 5,
        comment: 'The flares in this set are jaw-dropping. Incredible wash patterns. Truly grail tier pieces.',
        date: '2026-07-12'
      }
    ]
  },
  {
    id: '11',
    title: 'Archival Sage Panelled Cargo Utility Pants',
    price: 98,
    category: 'Cargo & Utility',
    image: imgSageUtility,
    description: 'Highly sought-after earthy sage green utility pants featuring multi-panel reinforced knees, secure side cargo pockets, and adjustable tab details. Beautiful military-grade heavy fade on rugged cotton canvas twill.',
    size: 'M (Waist 32)',
    condition: 'Gently Used',
    material: '100% Heavy Cotton Twill',
    year: '2000',
    isFeatured: false,
    reviews: []
  },
  {
    id: '12',
    title: 'Y2K Indigo Star-Embroidered Drawstring Pants',
    price: 85,
    category: 'Baggy Sweats',
    image: imgStarEmbroidered,
    description: 'Super relaxed drawstring denim sweatpants-style pants. Detailed with bold white star embroidery cascades along the side seams, deep hand pockets, and a comfortable thick elasticated waistband.',
    size: 'One Size (Waist 28-36)',
    condition: 'Excellent',
    material: 'Lightweight Slub Denim',
    year: '2004',
    isFeatured: false,
    reviews: []
  },
  {
    id: '13',
    title: '90s Slouchy Grainy Light-Wash Skater Jeans',
    price: 88,
    category: 'Denim Jeans',
    image: imgBaggyLightWash,
    description: 'Authentic 90s light-wash baggy jeans featuring a beautiful slubby grain pattern and clean natural vintage wear. Wide thigh ratio and generous leg opening that pools perfectly at the ankle.',
    size: 'L (Waist 34)',
    condition: 'Gently Used',
    material: '100% Cotton Slub Denim',
    year: '1999',
    isFeatured: false,
    reviews: []
  },
  {
    id: '14',
    title: 'Y2K Peek-a-Boo Character Baggy Jeans',
    price: 120,
    category: 'Denim Jeans',
    image: imgCharacterPocket,
    description: 'Unbelievably rare vintage skater jeans featuring a custom embroidered cute cartoon character peeking playfully out from the front utility pocket. Finished with deep pockets, yellow stitching, and a massive leg profile.',
    size: 'L (Waist 34)',
    condition: 'Mint',
    material: 'Premium Rigid Cotton Denim',
    year: '2001',
    isFeatured: true,
    reviews: [
      {
        id: 'r10',
        author: 'NigoFan_01',
        rating: 5,
        comment: 'I have been hunting for the character pocket jeans for five years. This condition is absolute gold.',
        date: '2026-07-18'
      }
    ]
  }
];

export const CATEGORIES = ['All', 'Denim Jeans', 'Cargo & Utility', 'Vintage Jorts', 'Baggy Sweats', 'Curated Sets'];
