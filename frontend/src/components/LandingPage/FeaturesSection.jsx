import SectionTitle from './SectionTitle';
import FeatureCard from './FeatureCard';
import { keyFeatures } from './data';

const FeaturesSection = () => (
  <section id="features" className="py-16 bg-white/5">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle>Why Choose EduPulse?</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyFeatures.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} index={idx} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;