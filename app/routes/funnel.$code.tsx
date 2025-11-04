import { json, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { Suspense, useState } from 'react';
import { FunnelStage } from '~/components/funnel/FunnelStage';
import { FunnelProgress } from '~/components/funnel/FunnelProgress';
import { WinterBackground } from '~/components/winter/WinterBackground';

interface FunnelData {
  id: string;
  code: string;
  name: string;
  stages: FunnelStageData[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface FunnelStageData {
  id: string;
  name: string;
  type: 'quiz' | 'product' | 'upsell' | 'checkout';
  content: any;
}

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { code } = params;
  
  if (!code) {
    throw new Response('Funnel code required', { status: 400 });
  }

  // Fetch funnel configuration from Shopify metaobjects
  try {
    const response = await context.storefront.query(FUNNEL_QUERY, {
      variables: { handle: code },
    });

    if (!response.metaobject) {
      throw new Response('Funnel not found', { status: 404 });
    }

    // Parse metaobject fields into funnel data
    const fields = response.metaobject.fields.reduce((acc: any, field: any) => {
      acc[field.key] = field.value;
      return acc;
    }, {});

    const funnelData: FunnelData = {
      id: response.metaobject.id,
      code,
      name: fields.name || code,
      stages: JSON.parse(fields.stages || '[]'),
      theme: JSON.parse(fields.theme || '{"primaryColor":"#3B82F6","secondaryColor":"#8B5CF6"}'),
    };

    return json({ funnel: funnelData });
  } catch (error) {
    console.error('Error loading funnel:', error);
    throw new Response('Error loading funnel', { status: 500 });
  }
}

export default function FunnelRoute() {
  const { funnel } = useLoaderData<typeof loader>();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Winter Background */}
      <WinterBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Suspense fallback={<FunnelLoadingSkeleton />}>
          <FunnelProgress 
            stages={funnel.stages}
            currentStage={currentStageIndex}
          />
          
          <FunnelStage
            stage={funnel.stages[currentStageIndex]}
            funnel={funnel}
            onNext={() => setCurrentStageIndex(prev => Math.min(prev + 1, funnel.stages.length - 1))}
            onPrevious={() => setCurrentStageIndex(prev => Math.max(prev - 1, 0))}
            isFirst={currentStageIndex === 0}
            isLast={currentStageIndex === funnel.stages.length - 1}
          />
        </Suspense>
      </div>
    </div>
  );
}

function FunnelLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

const FUNNEL_QUERY = `#graphql
  query FunnelByCode($handle: String!) {
    metaobject(handle: {type: "funnel", handle: $handle}) {
      id
      fields {
        key
        value
      }
    }
  }
`;
