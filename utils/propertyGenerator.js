// File: utils/propertyGenerator.js
// Description: Utility functions for generating random land parcels

// Helper function to generate a random integer between min and max (inclusive)
const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Generate a random land parcel
  const generateRandomLand = (level) => {
    // Land types with their characteristics
    const landTypes = [
      { type: 'residential', weight: 5, name: 'Residential Land' },
      { type: 'commercial', weight: 3, name: 'Commercial Land' },
      { type: 'mixeduse', weight: 2, name: 'Mixed-Use Land' }
    ];
  
    // Choose land type based on weighted probability
    let totalWeight = landTypes.reduce((sum, type) => sum + type.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedType = landTypes[0];
    
    for (const landType of landTypes) {
      if (randomWeight < landType.weight) {
        selectedType = landType;
        break;
      }
      randomWeight -= landType.weight;
    }
  
    // Generate size based on type and level (in square feet)
    let minSize, maxSize;
    switch (selectedType.type) {
      case 'residential':
        minSize = 2500 + (level * 500);
        maxSize = 15000 + (level * 2500);
        break;
      case 'commercial':
        minSize = 3500 + (level * 1000);
        maxSize = 25000 + (level * 5000);
        break;
      case 'mixeduse':
        minSize = 5000 + (level * 1500);
        maxSize = 50000 + (level * 10000);
        break;
      default:
        minSize = 2500;
        maxSize = 10000;
    }
    
    const size = randomInt(minSize, maxSize);
    
    // Base price per square foot based on type
    let basePricePerSqFt;
    switch (selectedType.type) {
      case 'residential':
        basePricePerSqFt = randomInt(20, 40);
        break;
      case 'commercial':
        basePricePerSqFt = randomInt(30, 60);
        break;
      case 'mixeduse':
        basePricePerSqFt = randomInt(40, 80);
        break;
      default:
        basePricePerSqFt = 25;
    }
    
    // Apply level multiplier to the price
    const levelMultiplier = 1 + (level * 0.1); // 10% increase per level
    const pricePerSqFt = Math.round(basePricePerSqFt * levelMultiplier);
    
    // Calculate total price
    const price = size * pricePerSqFt;
    
    // Generate random location
    const locations = [
      'Downtown',
      'Uptown',
      'West End',
      'East Side',
      'Waterfront',
      'Parkside',
      'Business District',
      'Suburban Area',
      'University District',
      'Industrial Zone',
      'Historic District',
      'Harbor View',
      'Central District',
      'Technology Park',
      'Riverside',
      'North Hills',
      'South Bay'
    ];
    const location = locations[randomInt(0, locations.length - 1)];
    
    // Determine ideal development type
    let idealFor;
    switch (selectedType.type) {
      case 'residential':
        if (size < 5000) {
          idealFor = 'Small House';
        } else if (size < 12000) {
          idealFor = 'Medium Apartments';
        } else {
          idealFor = 'Premium Apartments';
        }
        break;
      case 'commercial':
        if (size < 8000) {
          idealFor = 'Small Office';
        } else if (size < 20000) {
          idealFor = 'Office Building';
        } else {
          idealFor = 'Shopping Complex';
        }
        break;
      case 'mixeduse':
        if (size < 25000) {
          idealFor = 'Mixed-Use Development';
        } else {
          idealFor = 'Urban Village';
        }
        break;
      default:
        idealFor = 'General Development';
    }
    
    // Rate growth potential based on random factors
    const growthPotentials = ['Low', 'Medium', 'High', 'Very High'];
    const growthPotential = growthPotentials[randomInt(0, 3)];
    
    // Generate a unique ID
    const id = `land-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate a descriptive name for the land
    const landName = `${size.toLocaleString()} sq ft ${selectedType.type.charAt(0).toUpperCase() + selectedType.type.slice(1)} Land in ${location}`;
    
    // Return the generated land object
    return {
      id,
      name: landName,
      type: selectedType.type,
      size,
      pricePerSqFt,
      price,
      location,
      idealFor,
      growthPotential
    };
  };
  
  // Generate multiple random land parcels
  const generateRandomLands = (count, level) => {
    const lands = [];
    
    for (let i = 0; i < count; i++) {
      lands.push(generateRandomLand(level));
    }
    
    return lands;
  };
  
  export { generateRandomLand, generateRandomLands };