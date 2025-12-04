import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import FeatureCard from './FeatureCard';
import { gamificationFeatures } from './data';

const GamificationSection = () => (
  <section id="gamification" className="py-16 bg-white/5">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle>Make Learning Fun</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {gamificationFeatures.map((feature, idx) => (
          <div key={idx}>
            <FeatureCard {...feature} index={idx} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default GamificationSection;