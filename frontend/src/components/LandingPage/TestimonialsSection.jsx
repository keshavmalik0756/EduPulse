import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Computer Science Student",
    comment: "EduPulse transformed my learning experience. The AI-powered recommendations helped me focus on areas I needed to improve, and I saw my grades jump by 20% in just two months!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Mathematics Major",
    comment: "The gamified learning approach makes studying enjoyable. I've completed 15 courses and earned 42 badges. The progress tracking keeps me motivated to achieve my daily goals.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Educator",
    comment: "As a teacher, I love how EduPulse helps me track my students' progress and identify knowledge gaps. The analytics dashboard is incredibly insightful for improving my teaching methods.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Engineering Student",
    comment: "The collaborative features are game-changing. I formed a study group with peers from different countries, and we've tackled complex projects together. My problem-solving skills have improved dramatically.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Biology Student",
    comment: "EduPulse's adaptive learning system adjusted to my pace perfectly. The interactive quizzes and flashcards made memorizing complex biological processes so much easier and fun.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Physics Professor",
    comment: "Integrating EduPulse into my curriculum has enhanced student engagement significantly. The platform's real-time feedback system helps me adjust my teaching approach instantly.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=184&q=80"
  }
];

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
  >
    <div className="flex items-center mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-white/90 mb-6 italic">"{testimonial.comment}"</p>
    <div className="flex items-center">
      <img 
        src={testimonial.avatar} 
        alt={testimonial.name} 
        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white/30"
      />
      <div>
        <h4 className="font-bold text-white">{testimonial.name}</h4>
        <p className="text-white/70 text-sm">{testimonial.role}</p>
      </div>
    </div>
  </motion.div>
);

const TestimonialsSection = () => (
  <section id="testimonials" className="py-16 bg-white/5">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle>What Our Users Say</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;