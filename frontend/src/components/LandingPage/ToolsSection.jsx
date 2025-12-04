import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import FeatureCard from './FeatureCard';
import { studyTools } from './data';

const ToolsSection = () => (
  <section id="tools" className="py-16 bg-white/5">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle>Powerful Study Tools</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {studyTools.map((tool, idx) => (
          <FeatureCard key={idx} {...tool} index={idx} />
        ))}
      </div>
    </div>
  </section>
);

export default ToolsSection;