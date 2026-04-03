import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HomeNavbar from './HomeNavbar';
import { BrainCircuit } from 'lucide-react';
import FloatingOrb from './FloatingOrb';
import Logos from "./Logos"
import ExploreCourses from './ExploreCourses';
import CardPage from './CardPage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HERO_CONTENT, CHIPS, ORBS, HOME_STATIC_ASSETS } from '../../constants/homeData';

const HeroBadge = ({ badge, userName }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 border border-slate-200/50 backdrop-blur-xl mb-12 shadow-sm relative group overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${badge.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    <badge.icon className="w-4 h-4 text-emerald-600 animate-pulse" />
    <span className="text-xs font-black tracking-[0.3em] text-slate-800 uppercase relative z-10">
      {badge.text}: {userName}
    </span>
  </motion.div>
);

HeroBadge.propTypes = {
  badge: PropTypes.object.isRequired,
  userName: PropTypes.string.isRequired
};

const ActionButton = ({ button, onClick }) => (
  <button 
    onClick={onClick}
    className={button.primary 
      ? 'group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.1)]'
      : 'group px-8 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-slate-100 transition-all duration-300 shadow-sm'
    }
  >
    {!button.primary && button.secondaryIcon && (
      <div className={`p-1 rounded-lg ${button.secondaryIconBg}`}>
        <button.secondaryIcon className={`w-5 h-5 ${button.secondaryIconColor}`} />
      </div>
    )}
    <span>{button.label}</span>
    {button.icon && <button.icon className={`w-5 h-5 ${button.primary ? 'group-hover:translate-x-1 transition-transform' : ''}`} />}
  </button>
);

ActionButton.propTypes = {
  button: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

const StatusChip = ({ chip }) => (
  <motion.div 
    initial={{ opacity: 0, x: chip.position.includes('right') ? 50 : -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: chip.delay, duration: 1 }}
    className={`absolute ${chip.position} group cursor-default`}
  >
    <motion.div 
      animate={{ y: [0, chip.position.includes('bottom') ? 20 : -20, 0], rotate: [0, chip.position.includes('bottom') ? -2 : 2, 0] }}
      transition={{ duration: chip.duration, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
      className="p-5 bg-white/60 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-white/50 rounded-[32px] flex items-center gap-4 hover:bg-white/80 transition-colors duration-500"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${chip.color} flex items-center justify-center shadow-lg ${chip.shadow}`}>
        <chip.icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-left">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">{chip.label}</p>
        <p className="text-slate-900 font-black text-base tracking-tight italic">{chip.value}</p>
      </div>
    </motion.div>
  </motion.div>
);

StatusChip.propTypes = {
  chip: PropTypes.object.isRequired
};

function HomePage() {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const handleAction = (action) => {
        if (action === 'view_courses') {
            if (!user) {
                navigate('/login');
                return;
            }
            switch (user.role) {
                case 'student': navigate('/courses'); break;
                case 'educator': navigate('/educator/courses'); break;
                case 'admin': navigate('/dashboard/admin'); break;
                default: navigate('/home');
            }
        }
    };

    return (
        <div className='w-full overflow-hidden bg-white'>
            <HomeNavbar />
            <div className='relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-32 overflow-hidden border-b border-slate-100'>

                <div 
                    className="absolute inset-0 opacity-[0.03] mix-blend-multiply z-10 pointer-events-none"
                    style={{ backgroundImage: HOME_STATIC_ASSETS.NOISE_BG }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-emerald-50/20 pointer-events-none"></div>
                
                {ORBS.map((orb, index) => (
                    <FloatingOrb key={index} {...orb} />
                ))}

                <motion.div 
                    style={{ y: y1, opacity }}
                    className="relative z-20 max-w-7xl mx-auto px-4 text-center"
                >
                    <HeroBadge badge={HERO_CONTENT.badge} userName={user?.name?.split(' ')[0] || 'Explorer'} />
 
                    <motion.h1 
                        className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter"
                    >
                        {HERO_CONTENT.title.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 50, rotateX: -45 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ 
                                    duration: 1, 
                                    delay: i * 0.2, 
                                    ease: [0.215, 0.61, 0.355, 1] 
                                }}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word === "Future" ? (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-emerald-500 to-amber-500 px-2">
                                        Future
                                    </span>
                                ) : word}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="block text-4xl md:text-6xl lg:text-7xl mt-4 font-bold text-slate-400/50 tracking-normal italic"
                        >
                            {HERO_CONTENT.subtitle}
                        </motion.span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto mb-16 font-medium leading-relaxed"
                    >
                        {HERO_CONTENT.description.split(HERO_CONTENT.highlightText).map((part, i, arr) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="text-slate-900 font-bold underline decoration-blue-500/30">
                                        {HERO_CONTENT.highlightText}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className='flex flex-col sm:flex-row items-center justify-center gap-4'
                    >
                        {HERO_CONTENT.buttons.map((btn, index) => (
                            <ActionButton 
                                key={index} 
                                button={btn} 
                                onClick={btn.action === 'view_courses' ? () => handleAction(btn.action) : undefined} 
                            />
                        ))}
                    </motion.div>
                </motion.div>

                <div className="absolute inset-0 pointer-events-none hidden xl:block">
                    {CHIPS.map((chip, index) => (
                        <StatusChip key={index} chip={chip} />
                    ))}

                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, type: "spring" }}
                        className="absolute top-[60%] right-[20%] p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
                    >
                        <BrainCircuit className="w-8 h-8 text-amber-500 animate-pulse" />
                    </motion.div>
                </div>
            </div>

            <div className="relative z-30 bg-white">
                <Logos />
                <ExploreCourses />
                <CardPage />
            </div>
        </div> 
    );
}

export default HomePage;
