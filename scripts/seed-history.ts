import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../skills/shared/index';

const logger = createLogger('seed-history');
const prisma = new PrismaClient();

const TOKENS = ['ETH', 'BTC', 'SOL', 'BNB', 'MATIC', 'AVAX', 'PHRS'];
const DECISIONS = ['BUY', 'SELL', 'HOLD'] as const;

// Base prices for generating realistic inputs
const BASE_PRICES: Record<string, number> = {
  ETH: 3000,
  BTC: 65000,
  SOL: 140,
  BNB: 580,
  MATIC: 0.07,
  AVAX: 30,
  PHRS: 0.58
};

async function seedHistory() {
  logger.info('Starting custom history seeding...');

  // 1. Get Trading Agent
  const tradingAgent = await prisma.agent.findFirst({ where: { type: 'TRADING' } });
  if (!tradingAgent) {
    logger.error('Trading Agent not found in DB. Run seed first.');
    process.exit(1);
  }

  // 2. Clear current TRADING_CYCLE events
  await prisma.agentEvent.deleteMany({
    where: { event_type: 'TRADING_CYCLE' }
  });
  logger.info('Cleared existing TRADING_CYCLE events.');

  // 3. Generate balanced history (15 of each decision per token)
  const eventsData = [];
  const now = Date.now();

  for (const token of TOKENS) {
    const basePrice = BASE_PRICES[token];
    
    // Create 15 of each decision (BUY, SELL, HOLD) -> 45 total events per token
    const tokenDecisions: Array<'BUY' | 'SELL' | 'HOLD'> = [];
    for (let i = 0; i < 15; i++) {
      tokenDecisions.push('BUY', 'SELL', 'HOLD');
    }

    // Shuffle decisions to look natural
    for (let i = tokenDecisions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tokenDecisions[i], tokenDecisions[j]] = [tokenDecisions[j], tokenDecisions[i]];
    }

    // Build Prisma insert data
    for (let idx = 0; idx < tokenDecisions.length; idx++) {
      const decision = tokenDecisions[idx];
      
      // Spread out events over the last 24 hours (roughly every 30 minutes)
      const timeOffset = (tokenDecisions.length - idx) * 30 * 60 * 1000;
      const eventTimestamp = new Date(now - timeOffset);

      // Add slight random price fluctuation
      const priceOffset = basePrice * (1 + (Math.random() - 0.5) * 0.05);
      const forecastOffset = priceOffset * (decision === 'BUY' ? 1.02 : decision === 'SELL' ? 0.98 : 1.0);

      eventsData.push({
        agent_id: tradingAgent.id,
        event_type: 'TRADING_CYCLE',
        timestamp: eventTimestamp,
        inputs_json: {
          token,
          price: priceOffset,
          sentiment: decision === 'BUY' ? 0.4 : decision === 'SELL' ? -0.4 : 0.0,
          forecastDirection: decision === 'BUY' ? 'up' : decision === 'SELL' ? 'down' : 'sideways',
          forecastedPrice: forecastOffset,
          rlAction: decision,
          riskScore: decision === 'HOLD' ? 75 : 45,
          volatility: 0.15,
        },
        reasoning_text: `Decision: ${decision} for ${token} at price $${priceOffset.toFixed(4)}.`,
        output_json: {
          token,
          decision,
          txHash: null,
          riskScore: decision === 'HOLD' ? 75 : 45,
          riskBreakdown: {
            slippageRisk: 10,
            liquidityDepth: 10,
            positionSizePct: 15,
            volatilityScore: 20,
            sentimentRisk: decision === 'HOLD' ? 60 : 10,
            reputationRisk: 10,
          },
          forecast: {
            forecastedPrice: forecastOffset,
            confidence: 0.85,
            direction: decision === 'BUY' ? 'up' : decision === 'SELL' ? 'down' : 'sideways',
            model: 'numpy-fallback',
          },
          priceHistory: [basePrice * 0.98, basePrice * 0.99, priceOffset],
          sentiment: decision === 'BUY' ? 0.4 : decision === 'SELL' ? -0.4 : 0.0,
        },
        success: true,
      });
    }
  }

  // 4. Batch insert events
  logger.info(`Inserting ${eventsData.length} balanced history events...`);
  await prisma.agentEvent.createMany({
    data: eventsData
  });

  logger.info('History seeding complete! Database is now perfectly balanced.');
  await prisma.$disconnect();
}

seedHistory().catch(err => {
  logger.error('Failed to seed history', { error: String(err) });
  process.exit(1);
});
