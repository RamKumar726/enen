import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts } from '../redux/slices/productSlice';
import { Flame, ArrowLeft, Layers, Sparkles } from 'lucide-react';

const collectionBanners = {
  'One Piece': {
    title: 'ONE PIECE COLLECTION',
    tagline: 'The Warrior of Liberation & Straw Hat Pirates',
    description: 'Gear 5 Sun God Nika, Swordmaster Zoro, Diable Jambe Sanji & Monster Point Chopper graphics.',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80'
  },
  'Demon Slayer': {
    title: 'DEMON SLAYER COLLECTION',
    tagline: 'Hinokami Flame Breathing & Nine Hashira',
    description: 'Set your heart ablaze with Tanjiro, Nezuko, Hashira Squad & Muzan Demon King heavy cotton tees.',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80'
  },
  'Naruto': {
    title: 'NARUTO SHIPPUDEN COLLECTION',
    tagline: 'Kurama Chakra Seal & Rinnegan Lightning',
    description: 'Naruto Sage Mode, Sasuke Susanoo Indra & Kakashi Sharingan Raikiri limited streetwear.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
  },
  'Attack on Titan': {
    title: 'ATTACK ON TITAN COLLECTION',
    tagline: 'Freedom Wings & Colossal Titan Steam',
    description: 'If you win, you live. Eren Attack Titan, Levi Ackerman Blades & Mikasa Scarf washed graphic tees.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80'
  },
  'My Hero Academia': {
    title: 'MY HERO ACADEMIA COLLECTION',
    tagline: 'Plus Ultra & Symbol of Peace',
    description: 'Deku One For All Full Cowl, Bakugo Howitzer Impact & All Might oversized streetwear.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80'
  }
};

const CollectionPage = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);

  const decodedName = decodeURIComponent(collectionName || 'One Piece');
  const banner = collectionBanners[decodedName] || {
    title: `${decodedName.toUpperCase()} VAULT`,
    tagline: 'Official ENEN Anime Drop',
    description: 'Explore heavy cotton streetwear graphic tees.',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80'
  };

  useEffect(() => {
    dispatch(fetchProducts({ collection: decodedName, limit: 12 }));
    window.scrollTo(0, 0);
  }, [decodedName, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* BACK NAVIGATION */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#E85D3D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* COLLECTION BANNER HEADER */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E85D3D]/40 shadow-2xl h-80 flex items-center p-8 sm:p-12">
        <img
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover filter brightness-50 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12] via-[#0F0F12]/80 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E85D3D]/20 text-[#E85D3D] text-xs font-black uppercase rounded-lg border border-[#E85D3D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>ANIME COLLECTION VAULT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {banner.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {banner.description}
          </p>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <section className="space-y-6">
        <ProductGrid
          products={items}
          loading={loading}
          title={`${decodedName} Designs`}
          subtitle="EXPLORE THE COLLECTION"
        />
      </section>

    </div>
  );
};

export default CollectionPage;
