/**
 * Ocean Impact Tracker Component
 * Shows real-time ocean conservation impact
 */
import {motion} from 'framer-motion';
import {Waves, Leaf, Heart} from 'lucide-react';

interface OceanImpactTrackerProps {
  conversions: number;
  oceanImpact?: number;
}

export function OceanImpactTracker({
  conversions,
  oceanImpact = 0,
}: OceanImpactTrackerProps) {
  const plasticRemoved = (conversions * 1).toFixed(1);
  const coralPlanted = Math.floor(conversions * 0.5);
  const treesPlanted = Math.floor(conversions * 2);

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          🌊 WowMoment Impact
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{plasticRemoved}kg</div>
          <div className="text-xs text-gray-600 mt-1">Ocean Plastic Removed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600">{coralPlanted}m²</div>
          <div className="text-xs text-gray-600 mt-1">Coral Restored</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{treesPlanted}</div>
          <div className="text-xs text-gray-600 mt-1">Trees Planted</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Every purchase makes a <span className="font-semibold text-blue-600">WowMoment</span> for our oceans
        </p>
      </div>
    </motion.div>
  );
}
