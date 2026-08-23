
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';

const CUISINES = ['All', 'Indian', 'American', 'Italian', 'Japanese', 'South Indian', 'Fast Food'];

const FEATURED_DISHES = [
  {
    name: 'Thali',
    query: 'Thali',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'
  },
  {
    name: 'Paneer',
    query: 'Paneer',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'
  },
  {
    name: 'Burger',
    query: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Biryani',
    query: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'
  },
  {
    name: 'Pizza',
    query: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
  },
  {
    name: 'Dosa',
    query: 'Dosa',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400'
  },
  {
    name: 'Pasta',
    query: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'
  },
  {
    name: 'Coffee',
    query: 'Coffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
  }
];

const EXPLORE_OPTIONS = [
  {
    title: 'Popular cuisines near me',
    text: 'Browse Indian, fast food, Italian, and more to quickly find the right restaurant for your group.'
  },
  {
    title: 'Popular restaurant types near me',
    text: 'Filter by cafes, casual diners, dessert spots, and late-night favorites near your location.'
  },
  {
    title: 'Top restaurant chains',
    text: 'Jump into familiar chains your friends already know and trust for group ordering.'
  },
  {
    title: 'Cities we deliver to',
    text: 'See the growing list of cities where you can place group orders and split the bill easily.'
  },
  {
    title: 'Popular Dishes Near Me',
    text: 'Open trending dishes nearby to get a quick idea of what everyone is ordering right now.'
  }
];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [selectedDish, setSelectedDish] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [openExploreItem, setOpenExploreItem] = useState(null);
  const currentYear = new Date().getFullYear();
  const dishRowRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript || '';
          if (event.results[i].isFinal) finalTranscript += transcript;
          else interimTranscript += transcript;
        }

        const spokenText = `${finalTranscript} ${interimTranscript}`.trim();
        if (spokenText) {
          setSearch(spokenText);
        }
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone permission is blocked. Please allow microphone access for voice input.');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocalhost) {
      alert('Voice input needs a secure context (HTTPS or localhost).');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (sortBy) params.sortBy = sortBy;
      const res = await restaurantAPI.getAll(params);
      setRestaurants(res.data.restaurants);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, [search, selectedCuisine, sortBy]);

  const handleDishClick = (dish) => {
    setSelectedDish(dish.query);
    setSelectedCuisine('All');
    setSearch(dish.query);
  };

  const clearDishSelection = () => {
    setSelectedDish('');
    setSearch('');
  };

  const scrollDishRow = (direction) => {
    if (!dishRowRef.current) return;
    dishRowRef.current.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero section */}
      <div style={{ marginBottom: 40, padding: 24, background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(132,204,22,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontSize: 120, opacity: 0.08, fontFamily: 'Syne', fontWeight: 800, userSelect: 'none' }}>Food</div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: '#1F2937', margin: '0 0 12px', lineHeight: 1.1 }}>
              Campus food,<br /><span style={{ color: 'rgb(255, 140, 66)' }}>delivered fast. </span>
            </h1>
            <p style={{ color: '#6B7280', fontSize: 18, margin: '0 0 28px', maxWidth: 500 }}>
              Order individually or create a group order with your squad — split the bill automatically!
            </p>
            
            {/* Search bar */}
            <div style={{ display: 'flex', gap: 12, maxWidth: 520 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '14px 110px 14px 18px',
                    fontSize: 15,
                    borderRadius: 16,
                    border: '1px solid #D9C9AE',
                    background: '#FFFFFF',
                    color: '#1F2937'
                  }}
                  placeholder="Search restaurants or cuisines..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                <button
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Stop listening' : 'Start voice search'}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 44,
                    width: 44,
                    borderRadius: 22,
                    border: '1px solid #3A3D46',
                    background: '#1A1C21',
                    color: '#ECECEC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: isListening ? '0 0 0 2px rgba(255,255,255,0.14) inset' : 'none'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
                    <path d="M19 11a7 7 0 0 1-14 0" />
                    <path d="M12 18v3" />
                  </svg>
                  {!isListening && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        width: 24,
                        height: 2,
                        background: '#EF4444',
                        transform: 'rotate(-45deg)'
                      }}
                    />
                  )}
                </button>
              </div>

              <button className="btn-primary" style={{ padding: '14px 24px', fontSize: 15 }}>Search</button>
            </div>
          </div>

          <div style={{ flex: '0 1 420px', width: '100%', maxWidth: 420 }}>
            <video
              src={`${process.env.PUBLIC_URL}/hero-video.mp4`}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block', borderRadius: 22, background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Cuisine chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CUISINES.map(c => (
            <button key={c} onClick={() => setSelectedCuisine(c)} style={{ padding: '7px 16px', borderRadius: 20, border: selectedCuisine === c ? '1px solid #84CC16' : '1px solid #D9C9AE', background: selectedCuisine === c ? 'rgba(132,204,22,0.15)' : '#FFFDF8', color: selectedCuisine === c ? '#84CC16' : '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ marginLeft: 'auto', background: '#FFFDF8', border: '1px solid #D9C9AE', borderRadius: 10, color: '#6B7280', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Syne', fontSize: 13, outline: 'none' }}>
          <option value="">Sort: Default</option>
          <option value="rating">Top Rated</option>
          <option value="deliveryTime">Fastest Delivery</option>
        </select>
      </div>

      {/* Dish discovery strip */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#111827', margin: 0 }}>
            Eat what makes you happy
          </h2>
          {selectedDish && (
            <button
              onClick={clearDishSelection}
              style={{
                border: '1px solid #D9C9AE',
                borderRadius: 18,
                background: '#FFFDF8',
                color: '#6B7280',
                fontFamily: 'Syne',
                fontSize: 12,
                fontWeight: 700,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Clear dish
            </button>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            aria-label="Scroll dishes left"
            onClick={() => scrollDishRow('left')}
            style={{
              position: 'absolute',
              left: -10,
              top: '34%',
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#374151',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            }}
          >
            ←
          </button>

          <div
            ref={dishRowRef}
            style={{
              display: 'flex',
              gap: 28,
              overflowX: 'auto',
              padding: '6px 24px 8px',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none'
            }}
          >
            {FEATURED_DISHES.map((dish) => {
              const isActive = selectedDish === dish.query;

              return (
                <button
                  key={dish.query}
                  onClick={() => handleDishClick(dish)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'center',
                    minWidth: 128
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isActive ? '4px solid #84CC16' : '3px solid #FFFFFF',
                      boxShadow: isActive ? '0 0 0 3px rgba(132,204,22,0.28)' : '0 8px 18px rgba(0,0,0,0.12)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p
                    style={{
                      margin: '12px 0 0',
                      fontFamily: 'Syne',
                      fontWeight: isActive ? 800 : 700,
                      fontSize: 15,
                      color: isActive ? '#3F6212' : '#1F2937'
                    }}
                  >
                    {dish.name}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            aria-label="Scroll dishes right"
            onClick={() => scrollDishRow('right')}
            style={{
              position: 'absolute',
              right: -10,
              top: '34%',
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#374151',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Restaurant grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>Search</div>
          <h3 style={{ fontFamily: 'Syne', color: '#1F2937' }}>No restaurants found</h3>
          <p style={{ color: '#6B7280' }}>Try a different search or cuisine</p>
        </div>
      ) : (
        <>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        </>
      )}

      {/* Group order help */}
      <section
        style={{
          marginTop: 36,
          border: '1px solid #D9C9AE',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FFFFFF 100%)',
          padding: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#1F2937' }}>
              How to do a Group Order
            </h2>
            <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: 14 }}>
              Order together with friends and split the bill in minutes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/group-orders"
              style={{
                textDecoration: 'none',
                background: '#FF8C42',
                color: '#FFFFFF',
                borderRadius: 12,
                padding: '10px 16px',
                fontFamily: 'Syne',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              Create Group Order
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
          {[
            { title: '1. Start a group', text: 'Open Group Orders and create a new room for your friends.' },
            { title: '2. Share invite code', text: 'Send your room link or code so everyone can join quickly.' },
            { title: '3. Add items together', text: 'Each member adds dishes from the same restaurant menu.' },
            { title: '4. Split and checkout', text: 'Choose split mode, confirm totals, and place the order.' }
          ].map((step) => (
            <div
              key={step.title}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                background: '#FFFFFF',
                padding: 14
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontFamily: 'Syne', fontSize: 16, color: '#1F2937' }}>{step.title}</h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: 13, lineHeight: 1.45 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore options accordion */}
      <section className="home-explore-section" style={{ marginTop: 40 }}>
        <h2 className="home-explore-heading">
          Explore options near me
        </h2>

        <div style={{ display: 'grid', gap: 18 }}>
          {EXPLORE_OPTIONS.map((item, index) => {
            const isOpen = openExploreItem === index;

            return (
              <div
                key={item.title}
                style={{
                  border: '1px solid #E6E1D8',
                  borderRadius: 14,
                  background: '#FFFFFF',
                  boxShadow: isOpen ? '0 12px 30px rgba(31,41,55,0.06)' : '0 1px 0 rgba(31,41,55,0.02)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenExploreItem(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="home-explore-accordion-trigger"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left'
                  }}
                >
                  <span className="home-explore-accordion-title">
                    {item.title}
                  </span>

                  <span
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2B2B2B',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="home-explore-accordion-panel" style={{ maxWidth: 880 }}>
                    <p style={{ margin: 0 }}>{item.text}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 52,
          border: '1px solid #D9C9AE',
          borderRadius: 20,
          background: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '28px 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: '0 0 10px', fontFamily: 'Syne', fontWeight: 800, color: '#1F2937', fontSize: 17 }}>
              About riviggy
            </h3>
            <p style={{ margin: 0, color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
              Campus-first food delivery with group ordering, live rooms, and seamless bill split.
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 10px', fontFamily: 'Syne', fontWeight: 800, color: '#1F2937', fontSize: 17 }}>
              Learn More
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/group-orders" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>How group order works</Link>
              <Link to="/orders" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Track your orders</Link>
              <Link to="/cart" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Checkout & payment</Link>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 10px', fontFamily: 'Syne', fontWeight: 800, color: '#1F2937', fontSize: 17 }}>
              Social Links
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Instagram</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>X (Twitter)</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>YouTube</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>LinkedIn</a>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 10px', fontFamily: 'Syne', fontWeight: 800, color: '#1F2937', fontSize: 17 }}>
              Contact Us
            </h3>
            <div style={{ display: 'grid', gap: 8, color: '#374151', fontSize: 14 }}>
              <a href="mailto:support@riviggy.com" style={{ color: '#374151', textDecoration: 'none' }}>support@riviggy.com</a>
              <a href="tel:+911800123456" style={{ color: '#374151', textDecoration: 'none' }}>+91 1800 123 456</a>
              <span>Mon - Sun, 8:00 AM - 11:00 PM</span>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 10px', fontFamily: 'Syne', fontWeight: 800, color: '#1F2937', fontSize: 17 }}>
              Platform
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <a href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Partner with us</a>
              <a href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Careers</a>
              <a href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Investor relations</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EEE6D9', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: '#6B7280', fontSize: 13 }}>
          <span>Copyright {currentYear} riviggy. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
