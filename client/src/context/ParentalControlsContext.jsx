import { createContext, useContext, useState, useEffect } from 'react';

const AGE_RATINGS = {
  'G': 0,
  'PG': 10,
  'PG-13': 13,
  'R': 17,
  'NC-17': 17,
  'TV-Y': 0,
  'TV-G': 0,
  'TV-PG': 10,
  'TV-14': 14,
  'TV-MA': 17
};

const ParentalControlsContext = createContext();

export const ParentalControlsProvider = ({ children }) => {
  const [isKidMode, setIsKidMode] = useState(false);
  const [userAge, setUserAge] = useState(18);
  const [showParentalPrompt, setShowParentalPrompt] = useState(false);
  const [blockedRatings, setBlockedRatings] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const profiles = user.profiles || [];
      const activeProfile = profiles.find(p => p.id === user.activeProfile);

      if (activeProfile?.isKid) {
        setIsKidMode(true);
        setBlockedRatings(['R', 'NC-17', 'TV-MA']);
      }
    }
  }, []);

  const filterContent = (movies) => {
    if (!isKidMode) return movies;

    return movies.filter(movie => {
      const rating = movie.ageRating || 'PG-13';
      const minAge = AGE_RATINGS[rating] || 0;
      return minAge < 17;
    });
  };

  const isContentBlocked = (movie) => {
    if (!isKidMode) return false;
    const rating = movie.ageRating || 'PG-13';
    return blockedRatings.includes(rating);
  };

  const verifyPin = (pin) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const profiles = user.profiles || [];
      const activeProfile = profiles.find(p => p.id === user.activeProfile);
      return activeProfile?.pin === pin;
    }
    return false;
  };

  return (
    <ParentalControlsContext.Provider
      value={{
        isKidMode,
        setIsKidMode,
        userAge,
        setUserAge,
        showParentalPrompt,
        setShowParentalPrompt,
        blockedRatings,
        filterContent,
        isContentBlocked,
        verifyPin,
        AGE_RATINGS
      }}
    >
      {children}
    </ParentalControlsContext.Provider>
  );
};

export const useParentalControls = () => {
  const context = useContext(ParentalControlsContext);
  if (!context) {
    throw new Error('useParentalControls must be used within ParentalControlsProvider');
  }
  return context;
};

export default ParentalControlsContext;