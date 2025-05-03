// File: systems/PropertySystem.js
// Description: System for handling property-related game logic

// Property system to manage property purchases, construction, etc.
const PropertySystem = (entities, { touches, time, dispatch }) => {
  const { gameState, propertyState } = entities;
  
  if (!gameState || !propertyState) return entities;
  
  // Update construction projects
  if (propertyState.constructionProjects && propertyState.constructionProjects.length > 0) {
    propertyState.constructionProjects.forEach(project => {
      // Update progress based on time delta
      project.progress += (time.delta / (project.daysToComplete * 24 * 60 * 60 * 1000)) * 100;
      
      // Check for completion
      if (project.progress >= 100) {
        // Complete the project
        project.progress = 100;
        project.completed = true;
        
        // Move the property from constructionProjects to ownedProperties
        const property = propertyState.ownedProperties.find(p => p.id === project.propertyId);
        if (property) {
          property.status = 'completed';
          property.constructionType = project.constructionType;
          property.units = project.units;
          property.constructionDate = new Date().toISOString();
          property.currentValue = project.estimatedValue;
        }
        
        // Notify the UI
        dispatch({
          type: 'construction-completed',
          project: project
        });
      }
    });
    
    // Remove completed projects
    propertyState.constructionProjects = propertyState.constructionProjects.filter(
      project => !project.completed
    );
  }
  
  // Process property sales offers
  if (propertyState.propertiesForSale && propertyState.propertiesForSale.length > 0) {
    propertyState.propertiesForSale.forEach(property => {
      // Check if there are any offers
      if (property.offers && property.offers.length > 0) {
        // Sort offers by value (highest first)
        property.offers.sort((a, b) => b - a);
        
        // Check for automatic acceptance
        // e.g., if there's an offer within 90% of the asking price and it's been listed for more than 30 days
        const daysOnMarket = (Date.now() - property.listedDate) / (1000 * 60 * 60 * 24);
        const bestOffer = property.offers[0];
        
        if (bestOffer >= property.listingPrice * 0.9 && daysOnMarket > 30) {
          // Accept the offer
          gameState.balance += bestOffer;
          entities.balance.value = gameState.balance;
          
          // Remove from propertiesForSale
          propertyState.propertiesForSale = propertyState.propertiesForSale.filter(
            p => p.id !== property.id
          );
          
          // Remove from ownedProperties
          propertyState.ownedProperties = propertyState.ownedProperties.filter(
            p => p.id !== property.id
          );
          
          // Add to salesHistory
          propertyState.salesHistory.push({
            id: property.id,
            name: property.name,
            soldDate: new Date().toISOString(),
            soldPrice: bestOffer,
            type: property.type
          });
          
          // Notify the UI
          dispatch({
            type: 'property-sold',
            property: property,
            soldPrice: bestOffer
          });
        }
      }
    });
  }
  
  // Handle periodic generation of offers for properties on sale
  if (propertyState.timer >= 60000) { // Every minute
    propertyState.timer = 0;
    
    propertyState.propertiesForSale.forEach(property => {
      // Generate random offers based on property value and time on market
      const daysOnMarket = (Date.now() - property.listedDate) / (1000 * 60 * 60 * 24);
      const offerChance = Math.min(0.3, 0.05 + (daysOnMarket / 100)); // Increase chance over time
      
      if (Math.random() < offerChance) {
        // Generate an offer between 70% and 110% of the listing price
        const offerPercentage = 0.7 + (Math.random() * 0.4);
        const offerAmount = Math.round(property.listingPrice * offerPercentage);
        
        // Add the offer
        if (!property.offers) property.offers = [];
        property.offers.push(offerAmount);
        
        // Notify the UI
        dispatch({
          type: 'property-offer',
          propertyId: property.id,
          offerAmount: offerAmount
        });
      }
    });
  } else {
    propertyState.timer += time.delta;
  }
  
  // Check for refreshing available lands
  if (propertyState.landRefreshTimer >= propertyState.landRefreshInterval * 1000) {
    propertyState.landRefreshTimer = 0;
    
    // This would be replaced with a call to a function to generate new lands
    // but we'll just notify the UI here
    dispatch({
      type: 'refresh-available-lands'
    });
  } else {
    propertyState.landRefreshTimer += time.delta;
  }
  
  return entities;
};

// Handler for property-related events
const PropertyEventHandler = (entities, { events, dispatch }) => {
  if (!events) return entities;
  
  const { gameState, propertyState } = entities;
  
  events.forEach(event => {
    // Handle buying land
    if (event.type === 'buy-land') {
      const landId = event.landId;
      const land = propertyState.availableLands.find(l => l.id === landId);
      
      if (land && gameState.balance >= land.price) {
        // Deduct cost
        gameState.balance -= land.price;
        entities.balance.value = gameState.balance;
        
        // Add to owned properties
        const newProperty = {
          id: land.id,
          name: land.name,
          type: land.type,
          size: land.size,
          location: land.location,
          purchasePrice: land.price,
          purchaseDate: new Date().toISOString(),
          status: 'vacant',
          currentValue: land.price * 1.05, // 5% premium for development potential
          totalInvestment: land.price
        };
        
        propertyState.ownedProperties.push(newProperty);
        
        // Remove from available lands
        propertyState.availableLands = propertyState.availableLands.filter(
          l => l.id !== landId
        );
        
        // Update UI
        dispatch({
          type: 'property-update',
          balance: gameState.balance,
          properties: propertyState.ownedProperties.length
        });
      }
    }
    
    // Handle starting construction
    if (event.type === 'start-construction') {
      const { propertyId, constructionTypeId, cost, units, daysToComplete } = event;
      
      if (gameState.balance >= cost) {
        // Deduct cost
        gameState.balance -= cost;
        entities.balance.value = gameState.balance;
        
        // Update property status
        const property = propertyState.ownedProperties.find(p => p.id === propertyId);
        if (property) {
          property.status = 'inConstruction';
          property.totalInvestment += cost;
        }
        
        // Add to construction projects
        const newProject = {
          id: `const-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          propertyId: propertyId,
          name: property ? property.name : "Construction Project",
          location: property ? property.location : "Unknown",
          constructionType: constructionTypeId,
          startDate: new Date().toISOString(),
          units: units,
          daysToComplete: daysToComplete,
          progress: 0,
          budget: cost,
          estimatedValue: cost * 1.8, // 80% ROI
          boostAvailable: true
        };
        
        // Calculate completion date
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysToComplete);
        newProject.completionDate = completionDate.toISOString();
        
        propertyState.constructionProjects.push(newProject);
        
        // Update UI
        dispatch({
          type: 'property-update',
          balance: gameState.balance,
          properties: propertyState.ownedProperties.length
        });
      }
    }
    
    // Handle listing property for sale
    if (event.type === 'list-property') {
      const { propertyId, listingPrice } = event;
      
      const property = propertyState.ownedProperties.find(p => p.id === propertyId);
      if (property && property.status === 'completed') {
        // Update property status
        property.status = 'forSale';
        property.listingPrice = listingPrice;
        property.listedDate = Date.now();
        property.offers = [];
        
        // Add to properties for sale
        const listingProperty = { ...property };
        propertyState.propertiesForSale.push(listingProperty);
        
        // Update UI
        dispatch({
          type: 'property-update'
        });
      }
    }
    
    // Handle removing a listing
    if (event.type === 'remove-listing') {
      const { propertyId } = event;
      
      // Remove from properties for sale
      propertyState.propertiesForSale = propertyState.propertiesForSale.filter(
        p => p.id !== propertyId
      );
      
      // Update property status
      const property = propertyState.ownedProperties.find(p => p.id === propertyId);
      if (property) {
        property.status = 'completed';
        delete property.listingPrice;
        delete property.listedDate;
        delete property.offers;
      }
      
      // Update UI
      dispatch({
        type: 'property-update'
      });
    }
  });
  
  return entities;
};

export { PropertySystem, PropertyEventHandler };