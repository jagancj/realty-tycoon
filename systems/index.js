// File: systems/index.js
// Description: Main game systems for property and game state updates

import FeatureTile from "../components/FeatureTile";

// Update the player's balance based on properties owned
const UpdateBalance = (entities, { time }) => {
  const { gameState } = entities;
  
  // Calculate income from properties
  if (gameState) {
    // Only update if auto-increment is enabled
    if (gameState.autoIncrement && gameState.propertyTimer >= 1000) {
      // Reset the timer
      gameState.propertyTimer = 0;
      
      // Generate income based on properties and level
      const incomePerProperty = 50 * gameState.level;
      const totalIncome = incomePerProperty * gameState.properties;
      
      // Update the balance
      gameState.balance += totalIncome;
      entities.balance.value = gameState.balance;
      
      // Update the UI
      if (entities.gameEngine && entities.gameEngine.dispatch) {
        entities.gameEngine.dispatch({
          type: 'balance-update',
          balance: gameState.balance
        });
      }
    } else {
      // Increment the timer
      gameState.propertyTimer += time.delta;
    }
  }
  
  return entities;
};

// Process property offers
const ProcessOffers = (entities, { time, touches, dispatch }) => {
  const { gameState, offer } = entities;
  
  if (gameState && offer) {
    // Check for touches on the offer tile
    const touchedOffer = touches.find(t => t.type === 'press' && 
      t.event.pageX > 10 && t.event.pageX < 10 + 180 && 
      t.event.pageY > 240 && t.event.pageY < 240 + 100);
    
    if (touchedOffer && offer.active) {
      // Purchase the property
      if (gameState.balance >= offer.value) {
        // Subtract the cost
        gameState.balance -= offer.value;
        entities.balance.value = gameState.balance;
        
        // Add the property
        gameState.properties += 1;
        
        // Generate a new offer
        offer.active = false;
        offer.value = Math.floor(300000 + Math.random() * 200000);
        
        // Update the UI
        dispatch({
          type: 'balance-update',
          balance: gameState.balance
        });
      }
    }
    
    // Check if we should generate a new offer
    if (time.current - gameState.lastOfferTime > gameState.offerTimer * 1000) {
      // Generate a new offer
      offer.active = true;
      offer.value = Math.floor(300000 + Math.random() * 200000);
      
      // Update the last offer time
      gameState.lastOfferTime = time.current;
    }
  }
  
  return entities;
};

// Property timer system
const PropertyTimer = (entities, { time, touches, dispatch }) => {
  // Handle touches on the Properties button
  if (entities.propertiesButton) {
    const touchedProperties = touches.find(t => 
      t.type === 'press' && 
      t.event.pageX > entities.propertiesButton.position[0] && 
      t.event.pageX < entities.propertiesButton.position[0] + entities.propertiesButton.size[0] && 
      t.event.pageY > entities.propertiesButton.position[1] && 
      t.event.pageY < entities.propertiesButton.position[1] + entities.propertiesButton.size[1]
    );
    
    if (touchedProperties) {
      // Open the properties screen
      dispatch({
        type: 'open-properties'
      });
      
      // Update property state in the React component
      if (entities.propertyState) {
        dispatch({
          type: 'property-update',
          propertyState: entities.propertyState
        });
      }
    }
  }
  
  // Update construction tile display
  if (entities.construction && entities.propertyState) {
    const activeProjects = entities.propertyState.constructionProjects;
    if (activeProjects && activeProjects.length > 0) {
      // Show the first active project on the construction tile
      const currentProject = activeProjects[0];
      
      entities.construction.active = true;
      entities.construction.progress = currentProject.progress;
      
      // Update renderer to show progress
      entities.construction.renderer = (
        <FeatureTile 
          title="CONSTRUCTION" 
          value={`${Math.round(currentProject.progress)}%`}
          icon="construct" 
          backgroundColor="#62d68f"
          position="bottomLeft"
        />
      );
    } else {
      entities.construction.active = false;
      
      // Reset renderer
      entities.construction.renderer = (
        <FeatureTile 
          title="CONSTRUCTION" 
          icon="construct" 
          backgroundColor="#62d68f"
          position="bottomLeft"
        />
      );
    }
  }

  // Update deal tile with property information
  if (entities.deals && entities.propertyState) {
    const availableLands = entities.propertyState.availableLands;
    if (availableLands && availableLands.length > 0) {
      // Find the best value land
      const bestLand = availableLands.reduce((best, land) => {
        return (land.size / land.price > best.size / best.price) ? land : best;
      }, availableLands[0]);
      
      entities.deals.available = availableLands.length;
      entities.deals.bestValue = bestLand.price;
      
      // Update renderer to show available land count
      entities.deals.renderer = (
        <FeatureTile 
          title="LAND DEALS" 
          value={`${availableLands.length} Available`}
          icon="handshake" 
          backgroundColor="#f0a640"
          position="bottomRight"
        />
      );
    }
  }
  
  return entities;
};
const BalanceUpdateSystem = (entities, { events, dispatch }) => {
  if (!events) return entities;
  
  events.forEach(event => {
    if (event.type === 'balance-update' && entities.balance) {
      console.log("BalanceUpdateSystem received update:", event.balance);
      
      // Update the balance value
      entities.balance.value = event.balance;
      
      // Update the renderer component
      const Balance = require('../components/Balance').default;
      entities.balance.renderer = <Balance value={event.balance} />;
      
      // Log the updated entity
      console.log("Updated balance entity:", entities.balance);
    }
  });
  
  return entities;
};

export { UpdateBalance, ProcessOffers, PropertyTimer, BalanceUpdateSystem };