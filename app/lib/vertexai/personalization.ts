/**
 * Vertex AI Personalization Wrapper
 * Higher-level API for funnel personalization
 */
import {generatePersonalizedContent, type PersonalizationContext} from './personalizer';

export interface VertexAIRecommendation {
  productId: string;
  confidence: number;
  reason: string;
}

export async function getVertexAIRecommendations(
  context: PersonalizationContext & {funnelCode: string; visitorId: string}
): Promise<{
  recommendations: VertexAIRecommendation[];
  visitorSegment: string;
  oceanImpact: number;
}> {
  const content = await generatePersonalizedContent(context);
  
  return {
    recommendations: content.recommendations.map((rec, idx) => ({
      productId: `prod_${idx + 1}`,
      confidence: content.confidence,
      reason: rec,
    })),
    visitorSegment: determineSegment(context),
    oceanImpact: calculateOceanImpact(context),
  };
}

function determineSegment(context: any): string {
  if (context.answers?.concern === 'plastic') return 'eco_warrior';
  if (context.answers?.concern === 'marine_life') return 'animal_lover';
  return 'ocean_advocate';
}

function calculateOceanImpact(context: any): number {
  return context.currentStage * 0.5;
}
