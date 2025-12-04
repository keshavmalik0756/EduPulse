import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    // Simulate API call with better error handling
    try {
      // In a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate occasional "error" for demo purposes
      if (Math.random() < 0.1) {
        throw new Error('Network error');
      }
      
      setIsSubscribed(true);
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    } catch (error) {
      console.error('Subscription error:', error);
      // In a real app, you would show an error message to the user
      alert('There was an error subscribing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-blue-900/50 to-green-900/50 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-green-500/20 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Stay Connected
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest updates, study tips, and exclusive content. Join thousands of learners who are transforming their education with EduPulse.
          </p>
          
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-green-300 max-w-md mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Send size={32} />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Thank You!</h3>
              <p className="mb-4">You've been successfully subscribed to our newsletter.</p>
              <p className="text-sm">You'll receive our next update soon. Check your inbox!</p>
            </motion.div>
          ) : (
            <form 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={handleSubmit}
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200" size={20} />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg transition-all duration-300 hover:bg-white/20 focus:bg-white/15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                className="bg-blue-500 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto text-base sm:text-lg transition-all duration-300 hover:bg-blue-600 active:scale-95"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send size={24} />
                  </motion.div>
                ) : (
                  <>
                    <Send size={24} /> Subscribe
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;