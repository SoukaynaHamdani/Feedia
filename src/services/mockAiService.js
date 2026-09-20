export const generateMockReport = async (animalType, herdSize) => {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 3500));

  const baseWater = {
    cow: 40,
    sheep: 4,
    goat: 4,
    chicken: 0.25,
    camel: 20
  };

  const baseFood = {
    cow: 25,
    sheep: 1.5,
    goat: 1.5,
    chicken: 0.12,
    camel: 10
  };

  const waterPerAnimal = baseWater[animalType.toLowerCase()] || 10;
  const foodPerAnimal = baseFood[animalType.toLowerCase()] || 5;

  const totalWater = (waterPerAnimal * herdSize).toFixed(1);
  const totalFood = (foodPerAnimal * herdSize).toFixed(1);

  return {
    overview: {
      animal: animalType,
      size: herdSize,
      summary: `Optimized daily nutrition and hydration plan for ${herdSize} ${animalType}s.`
    },
    dailyNeeds: {
      water: `${totalWater} Liters`,
      food: `${totalFood} kg`,
      waterPerHead: `${waterPerAnimal} L/head`,
      foodPerHead: `${foodPerAnimal} kg/head`
    },
    nutritionalBreakdown: [
      { name: 'Carbohydrates', value: 50 },
      { name: 'Protein', value: 16 },
      { name: 'Fiber', value: 20 },
      { name: 'Fats', value: 4 },
      { name: 'Minerals/Vitamins', value: 10 }
    ],
    schedule: [
      { time: '06:00 AM', action: 'Morning feed (40% of daily intake) & fresh water refill.' },
      { time: '12:00 PM', action: 'Midday check, top-up water, light grazing/foraging.' },
      { time: '05:00 PM', action: 'Evening feed (60% of daily intake) & secure enclosures.' }
    ],
    recommendations: {
      localFood: 'Consider mixing local alfalfa, corn silage, and soybean meal to reduce costs while maintaining high protein.',
      healthWarnings: 'Ensure water sources are clean to prevent bacterial infections. Provide mineral licks to avoid deficiencies.',
      costSaving: 'Supplement up to 15% of the diet with locally available agricultural by-products (e.g., wheat bran).',
      productivity: 'Maintain a consistent feeding schedule to improve digestion and overall yield.'
    }
  };
};