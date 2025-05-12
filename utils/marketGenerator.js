// File: utils/marketGenerator.js
// Description: Utility functions for generating market elements

// Generate a random property listing for the market
export const generatePropertyListing = (playerLevel, marketCycle, constructionTypes) => {
    // Property types with their characteristics
    const propertyTypes = [
      { type: 'residential', weight: 5, name: 'Residential Property' },
      { type: 'commercial', weight: 3, name: 'Commercial Property' },
      { type: 'mixeduse', weight: 2, name: 'Mixed-Use Property' }
    ];
  
    // Choose property type based on weighted probability
    let totalWeight = propertyTypes.reduce((sum, type) => sum + type.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedType = propertyTypes[0];
    
    for (const propType of propertyTypes) {
      if (randomWeight < propType.weight) {
        selectedType = propType;
        break;
      }
      randomWeight -= propType.weight;
    }
  
    // Generate size based on type and level (in square feet)
    let minSize, maxSize;
    switch (selectedType.type) {
      case 'residential':
        minSize = 2500 + (playerLevel * 500);
        maxSize = 15000 + (playerLevel * 2500);
        break;
      case 'commercial':
        minSize = 3500 + (playerLevel * 1000);
        maxSize = 25000 + (playerLevel * 5000);
        break;
      case 'mixeduse':
        minSize = 5000 + (playerLevel * 1500);
        maxSize = 50000 + (playerLevel * 10000);
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
    
    // Apply level and market cycle multipliers to the price
    const levelMultiplier = 1 + (playerLevel * 0.1); // 10% increase per level
    
    // Market cycle affects prices
    let cycleMultiplier;
    switch (marketCycle) {
      case 'Recession':
        cycleMultiplier = 0.8; // Prices drop in recession
        break;
      case 'Recovery':
        cycleMultiplier = 0.9; // Prices start recovering
        break;
      case 'Expansion':
        cycleMultiplier = 1.1; // Prices rise in expansion
        break;
      case 'Peak':
        cycleMultiplier = 1.3; // Prices highest at peak
        break;
      default:
        cycleMultiplier = 1.0;
    }
    
    const adjustedPricePerSqFt = Math.round(basePricePerSqFt * levelMultiplier * cycleMultiplier);
    
    // Calculate total price
    const basePrice = size * adjustedPricePerSqFt;
    
    // Add random variation (+/- 10%)
    const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
    const price = Math.round(basePrice * (1 + variation));
    
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
    
    // Determine ideal development type based on property type
    let idealFor = [];
    
    if (selectedType.type === 'residential') {
      // Filter construction types to get residential options
      const residentialTypes = constructionTypes?.residential || [
        { name: 'Single Family Home', minLandSize: 2500 },
        { name: 'Apartment Building', minLandSize: 8000 },
        { name: 'Townhouses', minLandSize: 5000 }
      ];
      
      // Add suitable construction types based on size
      residentialTypes.forEach(type => {
        if (size >= type.minLandSize) {
          idealFor.push(type.name);
        }
      });
    } else if (selectedType.type === 'commercial') {
      // Filter for commercial options
      const commercialTypes = constructionTypes?.commercial || [
        { name: 'Office Building', minLandSize: 3000 },
        { name: 'Retail Center', minLandSize: 5000 },
        { name: 'Hotel', minLandSize: 10000 }
      ];
      
      // Add suitable construction types
      commercialTypes.forEach(type => {
        if (size >= type.minLandSize) {
          idealFor.push(type.name);
        }
      });
    } else if (selectedType.type === 'mixeduse') {
      // For mixed-use, add both residential and commercial options
      idealFor.push('Retail with Apartments');
      
      if (size >= 12000) {
        idealFor.push('Live-Work Development');
      }
      
      if (size >= 20000) {
        idealFor.push('Urban Village');
      }
    }
    
    // If no ideal uses found, add a default
    if (idealFor.length === 0) {
      idealFor.push('General Development');
    }
    
    // Generate property features based on type
    const features = generatePropertyFeatures(selectedType.type);
    
    // Generate market trend for the property
    let trend = 0;
    
    switch (marketCycle) {
      case 'Recession':
        trend = randomInt(-8, -1);
        break;
      case 'Recovery':
        trend = randomInt(-2, 5);
        break;
      case 'Expansion':
        trend = randomInt(2, 8);
        break;
      case 'Peak':
        trend = randomInt(-1, 6);
        break;
    }
    
    // Determine property status
    const statuses = ['New Listing', 'Price Reduced', 'Hot Property', 'Good Investment'];
    let status = statuses[randomInt(0, statuses.length - 1)];
    
    // Make price reductions more common in recession
    if (marketCycle === 'Recession' && Math.random() > 0.7) {
      status = 'Price Reduced';
    }
    
    // Make hot properties more common during expansion and peak
    if ((marketCycle === 'Expansion' || marketCycle === 'Peak') && Math.random() > 0.7) {
      status = 'Hot Property';
    }
    
    // Generate a descriptive name for the property
    const propertyName = `${size.toLocaleString()} sq ft ${selectedType.name} in ${location}`;
    
    // Return the generated property object
    return {
      id: `market-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: propertyName,
      type: selectedType.type,
      size,
      pricePerSqFt: adjustedPricePerSqFt,
      price,
      location,
      idealFor,
      features,
      trend,
      status,
      listedDate: Date.now(),
      fixedPrice: Math.random() > 0.7, // 30% chance of fixed price
      minPrice: Math.round(price * 0.8), // Minimum price if not fixed
      previousPrice: price // For tracking price changes
    };
  };
  
  // Generate an auction property
  export const generateAuctionProperty = (playerLevel, marketCycle, constructionTypes) => {
    // Start with a regular property listing
    const baseProp = generatePropertyListing(playerLevel, marketCycle, constructionTypes);
    
    // Auction types
    const auctionTypes = [
      'Foreclosure',
      'Estate Sale',
      'Bank Liquidation',
      'Developer Clearance',
      'Investment Opportunity'
    ];
    
    // Calculate market value (typically higher than starting bid)
    const marketValue = Math.round(baseProp.price * (1 + (Math.random() * 0.3)));
    
    // Calculate starting bid (typically below market value)
    const startingBid = Math.round(baseProp.price * (0.6 + (Math.random() * 0.2)));
    
    // Generate random auction duration (in minutes)
    const auctionDuration = 30 + Math.floor(Math.random() * 180); // 30 minutes to 3 hours
    
    // Create the auction object
    return {
      id: `auction-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: baseProp.name,
      propertyType: baseProp.type,
      size: baseProp.size,
      location: baseProp.location,
      type: auctionTypes[randomInt(0, auctionTypes.length - 1)],
      marketValue,
      startingBid,
      currentBid: startingBid,
      bidIncrement: Math.max(1000, Math.round(startingBid * 0.05)),
      timeLeft: auctionDuration * 60, // Convert to seconds
      startTime: Date.now(),
      endTime: Date.now() + (auctionDuration * 60 * 1000),
      highestBidder: 'system',
      previousBidder: null,
      bidHistory: [{
        bidder: 'system',
        amount: startingBid,
        time: Date.now()
      }],
      ended: false,
      features: baseProp.features,
      idealFor: baseProp.idealFor
    };
  };
  
  // Generate property features based on type
  const generatePropertyFeatures = (propertyType) => {
    const features = [];
    
    // Common features for all property types
    const commonFeatures = [
      'Corner Lot',
      'Near Public Transit',
      'Good School District',
      'Low Maintenance',
      'Near Parks',
      'Near Shopping'
    ];
    
    // Type-specific features
    const typeFeatures = {
      residential: [
        'Family Friendly',
        'Quiet Neighborhood',
        'Mature Trees',
        'Walkable Area',
        'Near Schools'
      ],
      commercial: [
        'High Foot Traffic',
        'Ample Parking',
        'Loading Dock',
        'Signage Opportunity',
        'Highway Access'
      ],
      mixeduse: [
        'Flexible Zoning',
        'Street-Level Retail',
        'Multiple Entrances',
        'Redevelopment Potential',
        'Live-Work Potential'
      ]
    };
    
    // Add 2-3 common features
    const numCommon = randomInt(2, 3);
    const shuffledCommon = shuffle([...commonFeatures]);
    
    for (let i = 0; i < numCommon && i < shuffledCommon.length; i++) {
      features.push(shuffledCommon[i]);
    }
    
    // Add 2-3 type-specific features
    if (typeFeatures[propertyType]) {
      const numType = randomInt(2, 3);
      const shuffledType = shuffle([...typeFeatures[propertyType]]);
      
      for (let i = 0; i < numType && i < shuffledType.length; i++) {
        features.push(shuffledType[i]);
      }
    }
    
    return features;
  };
  
  // Helper function to generate a random integer between min and max (inclusive)
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Helper function to shuffle an array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Generate market data for the UI
  export const generateInitialMarketData = () => {
    return {
      currentCycle: 'Recovery',
      
      // Sample data for price index chart
      priceIndex: [100, 98, 99, 102, 105, 108],
      
      // Sample regions with growth rates
      regions: [
        { name: 'Downtown', growth: 3, type: 'downtown' },
        { name: 'Suburban', growth: 2, type: 'suburban' },
        { name: 'Industrial', growth: -1, type: 'industrial' },
        { name: 'Waterfront', growth: 7, type: 'upcoming' }
      ],
      
      // Sample market opportunities
      opportunities: [
        {
          id: 'opp-1',
          title: 'Distressed Property Sale',
          description: 'A property being sold below market value',
          icon: 'tags'
        },
        {
          id: 'opp-2',
          title: 'Fast-Track Building Permit',
          description: 'Expedited approval for construction',
          icon: 'file-signature'
        }
      ]
    };
  };
  
  // Generate sample properties for market listings
  export const generateSampleListings = (count = 5) => {
    const listings = [];
    
    for (let i = 0; i < count; i++) {
      listings.push({
        id: `listing-${i}`,
        name: `${['Residential', 'Commercial', 'Mixed-Use'][i % 3]} Property in ${['Downtown', 'Suburban', 'Waterfront'][i % 3]}`,
        type: ['residential', 'commercial', 'mixeduse'][i % 3],
        size: 3000 + (i * 1000),
        price: 250000 + (i * 50000),
        location: ['Downtown', 'Suburban', 'Waterfront', 'Industrial'][i % 4],
        status: ['New Listing', 'Price Reduced', 'Hot Property'][i % 3],
        trend: [-3, 0, 2, 5][i % 4]
      });
    }
    
    return listings;
  };
  
  // Generate sample auctions
  export const generateSampleAuctions = (count = 3) => {
    const auctions = [];
    
    for (let i = 0; i < count; i++) {
      auctions.push({
        id: `auction-${i}`,
        name: `${['Residential', 'Commercial', 'Mixed-Use'][i % 3]} Property in ${['Downtown', 'Suburban', 'Waterfront'][i % 3]}`,
        propertyType: ['residential', 'commercial', 'mixeduse'][i % 3],
        location: ['Downtown', 'Suburban', 'Waterfront'][i % 3],
        type: ['Foreclosure', 'Estate Sale', 'Bank Liquidation'][i % 3],
        marketValue: 300000 + (i * 100000),
        currentBid: 230000 + (i * 80000),
        timeLeft: 30 + (i * 60) // minutes
      });
    }
    
    return auctions;
  };
  
  // Generate sample news
  export const generateSampleNews = (count = 5) => {
    const newsItems = [];
    
    const categories = [
      { category: 'Economic', color: '#3498db', icon: 'chart-line' },
      { category: 'Development', color: '#2ecc71', icon: 'building' },
      { category: 'Regulation', color: '#e74c3c', icon: 'gavel' },
      { category: 'Market', color: '#f39c12', icon: 'money-bill-wave' }
    ];
    
    const titles = [
      'Interest Rates Cut by 0.5%',
      'New Mall Development Approved',
      'Property Tax Reform Enacted',
      'Housing Inventory at Record Low',
      'Foreign Investment Surges in Downtown'
    ];
    
    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      const impact = [-5, -2, 3, 7][i % 4];
      
      newsItems.push({
        id: `news-${i}`,
        title: titles[i % titles.length],
        description: 'This development will affect property values in the region.',
        category: category.category,
        categoryColor: category.color,
        icon: category.icon,
        impact: impact,
        region: ['Downtown', 'Suburban', 'All Regions'][i % 3],
        time: ['1 hour ago', '3 hours ago', 'Yesterday'][i % 3]
      });
    }
    
    return newsItems;
  };