import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface FunnelStageProps {
  stage: {
    id: string;
    name: string;
    type: 'quiz' | 'product' | 'upsell' | 'checkout';
    content: any;
  };
  funnel: {
    id: string;
    name: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function FunnelStage({
  stage,
  funnel,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: FunnelStageProps) {
  const renderStageContent = () => {
    switch (stage.type) {
      case 'quiz':
        return <QuizStage content={stage.content} onComplete={onNext} />;
      case 'product':
        return <ProductStage content={stage.content} onAddToCart={onNext} />;
      case 'upsell':
        return <UpsellStage content={stage.content} onDecision={onNext} />;
      case 'checkout':
        return <CheckoutStage content={stage.content} />;
      default:
        return <DefaultStage content={stage.content} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="max-w-4xl mx-auto"
        >
          {/* Stage Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stage.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="w-5 h-5" />
              <span>Personalized just for you</span>
            </div>
          </motion.div>

          {/* Stage Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12"
          >
            {renderStageContent()}
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between mt-8"
          >
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            {!isLast && (
              <button
                onClick={onNext}
                style={{ backgroundColor: funnel.theme.primaryColor }}
                className="ml-auto flex items-center gap-2 px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Stage Type Components
function QuizStage({ content, onComplete }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-4">{content.question}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.options?.map((option: any, index: number) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-colors text-left"
          >
            <div className="font-semibold mb-2">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-600">{option.description}</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ProductStage({ content, onAddToCart }: any) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
          <img
            src={content.image || '/placeholder.jpg'}
            alt={content.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-bold">{content.name}</h3>
          <div className="text-2xl font-semibold text-blue-600">
            ${content.price}
          </div>
          <p className="text-gray-600">{content.description}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddToCart}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function UpsellStage({ content, onDecision }: any) {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        ⚡ Limited Time Offer
      </div>
      <h3 className="text-3xl font-bold">{content.title}</h3>
      <p className="text-xl text-gray-600">{content.description}</p>
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={onDecision}
          className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
        >
          Yes, Add This!
        </button>
        <button
          onClick={onDecision}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
        >
          No Thanks
        </button>
      </div>
    </div>
  );
}

function CheckoutStage({ content }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">Complete Your Order</h3>
      <p className="text-gray-600">Checkout integration goes here...</p>
    </div>
  );
}

function DefaultStage({ content }: any) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">{JSON.stringify(content)}</p>
    </div>
  );
}
