// File: systems/MarketSystem.js
// Description: System for handling market-related game logic
import { generatePropertyListing } from '../utils/marketGenerator';

// Market cycle phases
const MARKET_CYCLES = ['Recession', 'Recovery', 'Expansion', 'Peak'];

// System to handle market dynamics
const MarketSystem = (entities, { time, dispatch }) => {
  const { gameState, marketState, propertyState } = entities;
  
  if (!gameState || !marketState) return entities;
  
  // Update market timer
  marketState.timer += time.delta;
  
  // Market cycle progression - cycles change every few game months
  if (marketState.timer >= marketState.cycleUpdateInterval) {
    marketState.timer = 0;
    
    // Calculate if market cycle should change
    const shouldChangeCycle = Math.random() < 0.3; // 30% chance each cycle period
    
    if (shouldChangeCycle) {
      // Move to next cycle
      const currentIndex = MARKET_CYCLES.indexOf(marketState.currentCycle);
      const nextIndex = (currentIndex + 1) % MARKET_CYCLES.length;
      marketState.currentCycle = MARKET_CYCLES[nextIndex];
      
      // Apply market modifiers based on new cycle
      updateMarketModifiers(marketState);
      
      // Notify UI of cycle change
      dispatch({
        type: 'market-cycle-change',
        cycle: marketState.currentCycle
      });
    }
  }
  
  // Update region growth rates periodically
  if (marketState.regionTimer >= marketState.regionUpdateInterval) {
    marketState.regionTimer = 0;
    
    // Update each region's growth rate based on current cycle and random factors
    marketState.regions.forEach(region => {
      updateRegionGrowth(region, marketState.currentCycle);
    });
    
    // Notify UI of region updates
    dispatch({
      type: 'region-growth-update',
      regions: marketState.regions
    });
  } else {
    marketState.regionTimer += time.delta;
  }
  
  // Generate property listings periodically
  if (marketState.listingTimer >= marketState.listingUpdateInterval) {
    marketState.listingTimer = 0;
    
    // Check if we should add a new listing
    if (marketState.listings.length < marketState.maxListings) {
      const newListing = generatePropertyListing(
        gameState.level,
        marketState.currentCycle,
        propertyState.constructionTypes
      );
      
      marketState.listings.push(newListing);
      
      // Notify UI of new listing
      dispatch({
        type: 'new-property-listing',
        listing: newListing
      });
    }
    
    // Update prices on existing listings
    updateListingPrices(marketState.listings, marketState.currentCycle);
  } else {
    marketState.listingTimer += time.delta;
  }
  
  // Handle auction timers
  if (marketState.auctions.length > 0) {
    marketState.auctions.forEach(auction => {
      // Decrease remaining time
      auction.timeLeft -= time.delta / 1000; // Convert to seconds
      
      // Check if auction should end
      if (auction.timeLeft <= 0) {
        handleAuctionEnd(auction, marketState, gameState, dispatch);
      }
      
      // Generate NPC bids
      if (Math.random() < 0.05) { // 5% chance each tick
        generateNpcBid(auction, marketState.currentCycle);
      }
    });
    
    // Remove ended auctions
    marketState.auctions = marketState.auctions.filter(auction => !auction.ended);
  }
  
  // Generate news periodically
  if (marketState.newsTimer >= marketState.newsUpdateInterval) {
    marketState.newsTimer = 0;
    
    // Generate a new news item
    const newsItem = generateNewsItem(marketState);
    
    // Add to news feed
    marketState.news.unshift(newsItem);
    
    // Keep news feed at max length
    if (marketState.news.length > marketState.maxNewsItems) {
      marketState.news.pop();
    }
    
    // Apply effects of news on market
    applyNewsEffects(newsItem, marketState);
    
    // Notify UI of new news
    dispatch({
      type: 'market-news',
      news: newsItem
    });
  } else {
    marketState.newsTimer += time.delta;
  }
  
  // Update property price index
  if (marketState.indexTimer >= marketState.indexUpdateInterval) {
    marketState.indexTimer = 0;
    
    // Calculate new price index based on current cycle and regions
    const newIndex = calculatePriceIndex(marketState);
    marketState.priceIndex.push(newIndex);
    
    // Keep index at max length
    if (marketState.priceIndex.length > 12) {
      marketState.priceIndex.shift();
    }
    
    // Notify UI of updated index
    dispatch({
      type: 'price-index-update',
      priceIndex: marketState.priceIndex
    });
  } else {
    marketState.indexTimer += time.delta;
  }
  
  // Update opportunities periodically
  if (marketState.opportunityTimer >= marketState.opportunityUpdateInterval) {
    marketState.opportunityTimer = 0;
    
    // Check if we should add a new opportunity
    if (marketState.opportunities.length < marketState.maxOpportunities) {
      const newOpportunity = generateMarketOpportunity(gameState.level, marketState);
      
      marketState.opportunities.push(newOpportunity);
      
      // Notify UI of new opportunity
      dispatch({
        type: 'new-market-opportunity',
        opportunity: newOpportunity
      });
    }
    
    // Remove expired opportunities
    marketState.opportunities = marketState.opportunities.filter(opp => !opp.expired);
  } else {
    marketState.opportunityTimer += time.delta;
  }
  
  return entities;
};

// Update market modifiers based on current cycle
const updateMarketModifiers = (marketState) => {
  switch (marketState.currentCycle) {
    case 'Recession':
      marketState.priceModifier = 0.8;  // Prices drop
      marketState.demandModifier = 0.7; // Low demand
      marketState.supplyModifier = 1.2; // High supply
      break;
    case 'Recovery':
      marketState.priceModifier = 0.9;  // Prices start recovering
      marketState.demandModifier = 1.0; // Demand normalizes
      marketState.supplyModifier = 1.0; // Supply normalizes
      break;
    case 'Expansion':
      marketState.priceModifier = 1.1;  // Prices rise
      marketState.demandModifier = 1.2; // High demand
      marketState.supplyModifier = 0.9; // Reduced supply
      break;
    case 'Peak':
      marketState.priceModifier = 1.3;  // Prices at highest
      marketState.demandModifier = 1.3; // Very high demand
      marketState.supplyModifier = 0.8; // Low supply
      break;
    default:
      marketState.priceModifier = 1.0;
      marketState.demandModifier = 1.0;
      marketState.supplyModifier = 1.0;
  }
};

// Update growth rates for regions
const updateRegionGrowth = (region, currentCycle) => {
  // Base growth adjustment based on cycle
  let baseAdjustment = 0;
  
  switch (currentCycle) {
    case 'Recession':
      baseAdjustment = -5;
      break;
    case 'Recovery':
      baseAdjustment = 2;
      break;
    case 'Expansion':
      baseAdjustment = 5;
      break;
    case 'Peak':
      baseAdjustment = 3;
      break;
  }
  
  // Random factor (-3 to +3)
  const randomFactor = Math.floor(Math.random() * 7) - 3;
  
  // Apply region-specific modifier based on type
  let regionModifier = 0;
  
  switch (region.type) {
    case 'downtown':
      // Downtown does well in expansion and peak
      regionModifier = (currentCycle === 'Expansion' || currentCycle === 'Peak') ? 2 : -1;
      break;
    case 'suburban':
      // Suburbs are more stable
      regionModifier = 1;
      break;
    case 'industrial':
      // Industrial areas do better in recovery
      regionModifier = (currentCycle === 'Recovery') ? 3 : 0;
      break;
    case 'upcoming':
      // Upcoming areas have high volatility
      regionModifier = Math.floor(Math.random() * 10) - 4;
      break;
  }
  
  // Calculate new growth rate
  region.growth = baseAdjustment + randomFactor + regionModifier;
  
  // Cap growth rate between -10 and +15
  region.growth = Math.max(-10, Math.min(15, region.growth));
};

// Update prices on existing listings
const updateListingPrices = (listings, currentCycle) => {
  listings.forEach(listing => {
    // Only adjust non-fixed price listings
    if (!listing.fixedPrice) {
      // Base adjustment based on cycle
      let baseAdjustment = 0;
      
      switch (currentCycle) {
        case 'Recession':
          baseAdjustment = -0.02; // Prices drop by 2%
          break;
        case 'Recovery':
          baseAdjustment = 0.01; // Prices rise by 1%
          break;
        case 'Expansion':
          baseAdjustment = 0.03; // Prices rise by 3%
          break;
        case 'Peak':
          baseAdjustment = 0.04; // Prices rise by 4%
          break;
      }
      
      // Random factor (-1% to +1%)
      const randomFactor = (Math.random() * 0.02) - 0.01;
      
      // Calculate price adjustment
      const adjustment = listing.price * (baseAdjustment + randomFactor);
      
      // Update price and trend
      listing.previousPrice = listing.price;
      listing.price += Math.round(adjustment);
      listing.trend = Math.round((adjustment / listing.previousPrice) * 100);
      
      // Ensure price doesn't go below minimum
      listing.price = Math.max(listing.price, listing.minPrice);
    }
  });
};

// Handle auction ending
const handleAuctionEnd = (auction, marketState, gameState, dispatch) => {
  auction.ended = true;
  
  // Determine if player won
  if (auction.highestBidder === 'player') {
    // Player won the auction
    
    // Deduct the bid amount if not already done
    if (!auction.paymentProcessed) {
      // Process payment if player can afford it
      if (gameState.balance >= auction.currentBid) {
        gameState.balance -= auction.currentBid;
        auction.paymentProcessed = true;
        
        // Add property to player's owned properties
        // This would call to propertySystem to add the property
        dispatch({
          type: 'add-property',
          property: {
            id: `prop-${Date.now()}`,
            name: auction.name,
            type: auction.propertyType,
            location: auction.location,
            size: auction.size,
            price: auction.currentBid,
            purchaseDate: new Date().toISOString(),
            status: 'vacant',
            currentValue: auction.marketValue,
            totalInvestment: auction.currentBid
          }
        });
        
        // Notify UI of auction win
        dispatch({
          type: 'auction-won',
          auction: auction
        });
      } else {
        // Player can't afford it, cancel the win
        auction.highestBidder = auction.previousBidder || 'system';
        
        // Notify UI of payment failure
        dispatch({
          type: 'auction-payment-failed',
          auction: auction
        });
      }
    }
  } else {
    // NPC won the auction - remove from system
    
    // Notify UI of auction end
    dispatch({
      type: 'auction-ended',
      auction: auction
    });
  }
};

// Generate an NPC bid on an auction
const generateNpcBid = (auction, currentCycle) => {
  // Don't generate bids on ended auctions or if player is highest bidder with maxBid
  if (auction.ended || (auction.highestBidder === 'player' && auction.currentBid >= auction.maxBid)) {
    return;
  }
  
  // Calculate bid increment based on current price
  let increment = Math.max(1000, Math.round(auction.currentBid * 0.05));
  
  // Adjust based on cycle - more aggressive bidding in expansion/peak
  if (currentCycle === 'Expansion' || currentCycle === 'Peak') {
    increment = Math.round(increment * 1.2);
  }
  
  // Calculate maximum NPC bid (% of market value, varies by cycle)
  let maxBidPercent = 0.9; // Default 90% of market value
  
  switch (currentCycle) {
    case 'Recession':
      maxBidPercent = 0.75; // NPCs bid at most 75% in recession
      break;
    case 'Recovery':
      maxBidPercent = 0.85; // NPCs bid at most 85% in recovery
      break;
    case 'Expansion':
      maxBidPercent = 0.95; // NPCs bid at most 95% in expansion
      break;
    case 'Peak':
      maxBidPercent = 1.05; // NPCs may overbid in peak market
      break;
  }
  
  const maxNpcBid = Math.round(auction.marketValue * maxBidPercent);
  
  // Determine if NPC will place a bid
  if (auction.currentBid + increment <= maxNpcBid) {
    // Store previous bidder
    auction.previousBidder = auction.highestBidder;
    
    // Place NPC bid
    auction.highestBidder = `npc-${Math.floor(Math.random() * 1000)}`;
    auction.currentBid += increment;
    
    // Add to bid history
    auction.bidHistory.push({
      bidder: auction.highestBidder,
      amount: auction.currentBid,
      time: Date.now()
    });
  }
};

// Generate market news
const generateNewsItem = (marketState) => {
  // News categories with their characteristics
  const newsCategories = [
    { 
      category: 'Economic', 
      color: '#3498db', 
      icon: 'chart-line',
      headlines: [
        { title: 'Interest Rates Change', impact: [-3, 3] },
        { title: 'GDP Growth Exceeds Expectations', impact: [1, 5] },
        { title: 'Economic Slowdown Predicted', impact: [-5, -1] },
        { title: 'Central Bank Announces New Policy', impact: [-4, 4] }
      ]
    },
    { 
      category: 'Development', 
      color: '#2ecc71', 
      icon: 'building',
      headlines: [
        { title: 'New Mall Development Approved', impact: [2, 6] },
        { title: 'Highway Extension Project Delayed', impact: [-3, 0] },
        { title: 'Urban Renewal Initiative Launched', impact: [3, 7] },
        { title: 'Construction Costs Rising', impact: [-4, -1] }
      ]
    },
    { 
      category: 'Regulation', 
      color: '#e74c3c', 
      icon: 'gavel',
      headlines: [
        { title: 'New Zoning Laws Enacted', impact: [-5, 5] },
        { title: 'Property Tax Increase Approved', impact: [-6, -2] },
        { title: 'Government Subsidies for Home Buyers', impact: [2, 5] },
        { title: 'Building Regulations Tightened', impact: [-4, -1] }
      ]
    },
    { 
      category: 'Market', 
      color: '#f39c12', 
      icon: 'money-bill-wave',
      headlines: [
        { title: 'Housing Inventory at Record Low', impact: [3, 7] },
        { title: 'Foreign Investment Increasing', impact: [2, 6] },
        { title: 'Market Analysts Predict Price Drop', impact: [-7, -3] },
        { title: 'Mortgage Applications Surge', impact: [2, 5] }
      ]
    }
  ];
  
  // Select random category
  const category = newsCategories[Math.floor(Math.random() * newsCategories.length)];
  
  // Select random headline from category
  const headline = category.headlines[Math.floor(Math.random() * category.headlines.length)];
  
  // Generate random impact within headline's range
  const impactRange = headline.impact;
  const impact = impactRange[0] + Math.random() * (impactRange[1] - impactRange[0]);
  
  // Select random region or "All Regions"
  const regions = ['Downtown', 'Suburban', 'Industrial', 'Waterfront', 'All Regions'];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Generate description based on impact
  let description = '';
  if (impact > 0) {
    description = `Positive effect on property values expected in affected areas.`;
  } else {
    description = `Some property values may be negatively affected in the short term.`;
  }
  
  // Create news item
  return {
    id: `news-${Date.now()}`,
    title: headline.title,
    description,
    category: category.category,
    categoryColor: category.color,
    icon: category.icon,
    impact: Math.round(impact * 10) / 10, // Round to 1 decimal place
    region,
    time: '1 hour ago', // This would be dynamically generated based on game time
    read: false
  };
};

// Apply effects of news to market
const applyNewsEffects = (newsItem, marketState) => {
  // Apply impact to affected regions
  if (newsItem.region === 'All Regions') {
    // Apply to all regions, at 70% effect
    marketState.regions.forEach(region => {
      region.growth += (newsItem.impact * 0.7);
      
      // Cap growth rate between -10 and +15
      region.growth = Math.max(-10, Math.min(15, region.growth));
    });
  } else {
    // Find matching region and apply full effect
    const region = marketState.regions.find(r => r.name === newsItem.region);
    if (region) {
      region.growth += newsItem.impact;
      
      // Cap growth rate between -10 and +15
      region.growth = Math.max(-10, Math.min(15, region.growth));
    }
  }
  
  // Adjust market cycle timer based on significant news
  if (Math.abs(newsItem.impact) > 5) {
    // Big news can accelerate cycle changes
    marketState.timer += marketState.cycleUpdateInterval * 0.2;
  }
};

// Calculate property price index based on market state
const calculatePriceIndex = (marketState) => {
  // Start with last index value or 100 as base
  const lastIndex = marketState.priceIndex.length > 0 
    ? marketState.priceIndex[marketState.priceIndex.length - 1] 
    : 100;
  
  // Calculate average region growth
  const avgGrowth = marketState.regions.reduce((sum, region) => {
    return sum + region.growth;
  }, 0) / marketState.regions.length;
  
  // Apply cycle modifier
  let cycleModifier = 0;
  switch (marketState.currentCycle) {
    case 'Recession':
      cycleModifier = -1.5;
      break;
    case 'Recovery':
      cycleModifier = 1;
      break;
    case 'Expansion':
      cycleModifier = 2;
      break;
    case 'Peak':
      cycleModifier = 0.5;
      break;
  }
  
  // Random market noise (-0.5 to +0.5)
  const marketNoise = Math.random() - 0.5;
  
  // Calculate percentage change
  const percentChange = (avgGrowth / 20) + (cycleModifier / 10) + (marketNoise / 10);
  
  // Calculate new index
  const newIndex = Math.round(lastIndex * (1 + percentChange));
  
  return newIndex;
};

// Generate market opportunity
const generateMarketOpportunity = (playerLevel, marketState) => {
  // Opportunity types
  const opportunityTypes = [
    {
      type: 'distressed_sale',
      title: 'Distressed Property Sale',
      description: 'A property being sold below market value',
      icon: 'tags',
      value: 'high',
      cycle: 'Recession' // Most common in recession
    },
    {
      type: 'development_permit',
      title: 'Fast-Track Building Permit',
      description: 'Expedited approval for construction',
      icon: 'file-signature',
      value: 'medium',
      cycle: 'Recovery' // Most common in recovery
    },
    {
      type: 'investor_partnership',
      title: 'Investment Partnership',
      description: 'Partner with an investor to share costs and profits',
      icon: 'handshake',
      value: 'high',
      cycle: 'Expansion' // Most common in expansion
    },
    {
      type: 'market_insight',
      title: 'Market Insider Info',
      description: 'Advance knowledge of upcoming market changes',
      icon: 'eye',
      value: 'medium',
      cycle: 'Peak' // Most common in peak
    },
    {
      type: 'renovation_deal',
      title: 'Renovation Contractor Deal',
      description: 'Discounted renovation services for a limited time',
      icon: 'hammer',
      value: 'low',
      cycle: 'any' // Common in any cycle
    }
  ];
  
  // Filter opportunities by current cycle and add weighting
  const weightedTypes = opportunityTypes.map(type => {
    let weight = 1;
    
    // Boost weight if opportunity matches current cycle
    if (type.cycle === marketState.currentCycle) {
      weight = 3;
    } else if (type.cycle === 'any') {
      weight = 2;
    }
    
    return { ...type, weight };
  });
  
  // Select opportunity type based on weights
  let totalWeight = weightedTypes.reduce((sum, type) => sum + type.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedType = weightedTypes[0];
  
  for (const type of weightedTypes) {
    if (random < type.weight) {
      selectedType = type;
      break;
    }
    random -= type.weight;
  }
  
  // Calculate expiration time (between 2-5 game days)
  const expirationTime = Date.now() + (2 + Math.floor(Math.random() * 3)) * 86400000;
  
  // Generate opportunity details based on type
  let details = {};
  
  switch (selectedType.type) {
    case 'distressed_sale':
      details = {
        propertyType: Math.random() > 0.5 ? 'residential' : 'commercial',
        discount: 20 + Math.floor(Math.random() * 20), // 20-40% discount
        location: marketState.regions[Math.floor(Math.random() * marketState.regions.length)].name
      };
      break;
    case 'development_permit':
      details = {
        timeReduction: 20 + Math.floor(Math.random() * 30), // 20-50% time reduction
        maxSize: 10000 + (playerLevel * 5000) // Size limit based on player level
      };
      break;
    case 'investor_partnership':
      details = {
        investmentShare: 30 + Math.floor(Math.random() * 20), // 30-50% investment
        profitShare: 20 + Math.floor(Math.random() * 15) // 20-35% profit share
      };
      break;
    case 'market_insight':
      // Predict the next market cycle
      const currentIndex = MARKET_CYCLES.indexOf(marketState.currentCycle);
      const nextCycle = MARKET_CYCLES[(currentIndex + 1) % MARKET_CYCLES.length];
      details = {
        prediction: `Market likely to enter ${nextCycle} phase soon`,
        accuracy: 70 + Math.floor(Math.random() * 20) // 70-90% accuracy
      };
      break;
    case 'renovation_deal':
      details = {
        discount: 15 + Math.floor(Math.random() * 15), // 15-30% discount
        specialization: ['Luxury', 'Standard', 'Budget'][Math.floor(Math.random() * 3)]
      };
      break;
  }
  
  // Create opportunity
  return {
    id: `opp-${Date.now()}`,
    title: selectedType.title,
    description: selectedType.description,
    icon: selectedType.icon,
    value: selectedType.value,
    type: selectedType.type,
    details,
    expirationTime,
    expired: false,
    claimed: false
  };
};

// Event handler for market events
const MarketEventHandler = (entities, { events, dispatch }) => {
  if (!events) return entities;
  
  const { gameState, marketState } = entities;
  
  events.forEach(event => {
    // Handle buying property from market
    if (event.type === 'buy-market-property') {
      const propertyId = event.propertyId;
      const property = marketState.listings.find(listing => listing.id === propertyId);
      
      if (property && gameState.balance >= property.price) {
        // Deduct cost
        gameState.balance -= property.price;
        entities.balance.value = gameState.balance;
        
        // Add to owned properties (via property system)
        dispatch({
          type: 'add-property',
          property: {
            id: `prop-${Date.now()}`,
            name: property.name,
            type: property.type,
            size: property.size,
            location: property.location,
            purchasePrice: property.price,
            purchaseDate: new Date().toISOString(),
            status: 'vacant',
            currentValue: property.price,
            totalInvestment: property.price
          }
        });
        
        // Remove from listings
        marketState.listings = marketState.listings.filter(
          listing => listing.id !== propertyId
        );
        
        // Notify UI
        dispatch({
          type: 'property-purchased',
          property: property
        });
      }
    }
    
    // Handle placing auction bid
    else if (event.type === 'place-auction-bid') {
      const { auctionId, bidAmount } = event;
      const auction = marketState.auctions.find(a => a.id === auctionId);
      
      if (auction && bidAmount > auction.currentBid && gameState.balance >= bidAmount) {
        // Valid bid
        
        // Store previous bidder
        auction.previousBidder = auction.highestBidder;
        
        // Update auction
        auction.highestBidder = 'player';
        auction.currentBid = bidAmount;
        
        // Add to bid history
        auction.bidHistory.push({
          bidder: 'player',
          amount: bidAmount,
          time: Date.now()
        });
        
        // Notify UI
        dispatch({
          type: 'auction-bid-placed',
          auction: auction
        });
      }
    }
    
    // Handle claiming an opportunity
    else if (event.type === 'claim-opportunity') {
      const opportunityId = event.opportunityId;
      const opportunity = marketState.opportunities.find(opp => opp.id === opportunityId);
      
      if (opportunity && !opportunity.claimed && !opportunity.expired) {
        // Mark as claimed
        opportunity.claimed = true;
        
        // Apply opportunity effects
        applyOpportunityEffects(opportunity, entities, dispatch);
        
        // Notify UI
        dispatch({
          type: 'opportunity-claimed',
          opportunity: opportunity
        });
      }
    }
  });
  
  return entities;
};

// Apply effects of claiming an opportunity
const applyOpportunityEffects = (opportunity, entities, dispatch) => {
  const { gameState, marketState, propertyState } = entities;
  
  switch (opportunity.type) {
    case 'distressed_sale':
      // Create a special discounted property listing
      const discountedProperty = generatePropertyListing(
        gameState.level,
        marketState.currentCycle,
        propertyState.constructionTypes
      );
      
      // Apply discount
      const originalPrice = discountedProperty.price;
      discountedProperty.price = Math.round(originalPrice * (1 - (opportunity.details.discount / 100)));
      discountedProperty.discounted = true;
      discountedProperty.originalPrice = originalPrice;
      discountedProperty.discount = opportunity.details.discount;
      
      // Add to listings
      marketState.listings.push(discountedProperty);
      
      // Notify UI
      dispatch({
        type: 'distressed-property-available',
        property: discountedProperty
      });
      break;
      
    case 'development_permit':
      // Add permit to player inventory
      if (!gameState.permits) {
        gameState.permits = [];
      }
      
      gameState.permits.push({
        id: `permit-${Date.now()}`,
        type: 'fast-track',
        timeReduction: opportunity.details.timeReduction,
        maxSize: opportunity.details.maxSize,
        expirationTime: Date.now() + (30 * 86400000) // 30 days
      });
      break;
      
    case 'investor_partnership':
      // Add investor to player partnerships
      if (!gameState.partnerships) {
        gameState.partnerships = [];
      }
      
      gameState.partnerships.push({
        id: `partner-${Date.now()}`,
        name: `Investor ${Math.floor(Math.random() * 100)}`,
        investmentShare: opportunity.details.investmentShare,
        profitShare: opportunity.details.profitShare,
        expirationTime: Date.now() + (60 * 86400000) // 60 days
      });
      break;
      
    case 'market_insight':
      // Reveal market prediction
      dispatch({
        type: 'market-prediction',
        prediction: opportunity.details.prediction,
        accuracy: opportunity.details.accuracy
      });
      break;
      
    case 'renovation_deal':
      // Add renovation discount to player
      if (!gameState.renovationDiscounts) {
        gameState.renovationDiscounts = [];
      }
      
      gameState.renovationDiscounts.push({
        id: `renov-${Date.now()}`,
        discount: opportunity.details.discount,
        specialization: opportunity.details.specialization,
        expirationTime: Date.now() + (20 * 86400000) // 20 days
      });
      break;
  }
};

// Initialize market state
const initializeMarketState = (level = 1) => {
  // Return initial market state object
  return {
    currentCycle: 'Recovery', // Start in recovery phase
    priceModifier: 0.9,
    demandModifier: 1.0,
    supplyModifier: 1.0,
    
    // Regions with initial growth rates
    regions: [
      { name: 'Downtown', type: 'downtown', growth: 3 },
      { name: 'Suburban', type: 'suburban', growth: 2 },
      { name: 'Industrial', type: 'industrial', growth: 0 },
      { name: 'Waterfront', type: 'upcoming', growth: 5 }
    ],
    
    // Property listings
    listings: [],
    maxListings: 10 + level,
    
    // Auctions
    auctions: [],
    maxAuctions: 3 + Math.floor(level / 2),
    
    // News feed
    news: [],
    maxNewsItems: 10,
    
    // Market opportunities
    opportunities: [],
    maxOpportunities: 3,
    
    // Property price index (starts at 100)
    priceIndex: [100],
    
    // Timers and intervals
    timer: 0,
    cycleUpdateInterval: 300000, // 5 minutes
    regionTimer: 0,
    regionUpdateInterval: 180000, // 3 minutes
    listingTimer: 0,
    listingUpdateInterval: 60000, // 1 minute
    newsTimer: 0,
    newsUpdateInterval: 120000, // 2 minutes
    indexTimer: 0,
    indexUpdateInterval: 240000, // 4 minutes
    opportunityTimer: 0,
    opportunityUpdateInterval: 300000 // 5 minutes
  };
};

export { MarketSystem, MarketEventHandler, initializeMarketState };