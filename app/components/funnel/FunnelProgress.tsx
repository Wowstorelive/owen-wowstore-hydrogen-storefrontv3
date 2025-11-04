import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FunnelProgressProps {
  stages: Array<{
    id: string;
    name: string;
  }>;
  currentStage: number;
}

export function FunnelProgress({ stages, currentStage }: FunnelProgressProps) {
  return (
    <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentStage ? 1.2 : 1,
                    backgroundColor: index <= currentStage ? '#3B82F6' : '#E5E7EB',
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold relative z-10"
                >
                  {index < currentStage ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-xs font-medium ${
                    index === currentStage ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: index < currentStage ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-blue-600 rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
