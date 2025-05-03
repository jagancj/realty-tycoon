
// File: systems/index.js
// Description: Main game systems for property and game state updates
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
  const ProcessOffers = (entities, { time, touches }) => {
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
          if (entities.gameEngine && entities.gameEngine.dispatch) {
            entities.gameEngine.dispatch({
              type: 'balance-update',
              balance: gameState.balance
            });
          }
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
  const PropertyTimer = (entities, { time }) => {
    // Add time-based game logic here
    
    return entities;
  };
  
  export { UpdateBalance, ProcessOffers, PropertyTimer };