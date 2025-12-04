import HomeNavbar from './HomeNavbar';
import home from '../../assets/home1.jpg';
import { SiViaplay } from 'react-icons/si';
import ai from "../../assets/ai.png";
import ai1 from "../../assets/SearchAi.png";
import Logos from "./Logos"
import ExploreCourses from './ExploreCourses';
import CardPage from './CardPage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const handleViewCourses = () => {
        if (!user) {
            // If not authenticated, redirect to login
            navigate('/login');
            return;
        }

        // Navigate based on user role
        switch (user.role) {
            case 'student':
                navigate('/courses');
                break;
            case 'educator':
                navigate('/educator/courses');
                break;
            case 'admin':
                // Admins might not have a specific courses page, so redirect to admin dashboard
                navigate('/dashboard/admin');
                break;
            default:
                // Fallback to home page
                navigate('/home');
        }
    };

    return (
        <div className='w-[100%] overflow-hidden'>
            <div className='w-[100%] lg:h-[140vh] md:h-[100vh] sm:h-[80vh] h-[70vh] relative'>
                <HomeNavbar />

                {/* Background Image - Optimized for 768px */}
                <img
                    src={home}
                    alt=""
                    className='object-cover md:object-cover w-[100%] lg:h-[100%] md:h-[100%] sm:h-[100%] h-[50vh]'
                />

                {/* First Text Line - 768px follows mobile structure */}
                <span className='lg:text-[70px] md:text-[40px] sm:text-[35px] text-[22px] absolute lg:top-[10%] md:top-[15%] sm:top-[15%] top-[15%] w-[100%] flex items-center justify-center text-white font-bold px-2 sm:px-4 md:px-4 text-center leading-tight'>
                    Grow Your Skills to Advance
                </span>

                {/* Second Text Line - 768px follows mobile structure */}
                <span className='lg:text-[70px] md:text-[40px] sm:text-[35px] text-[22px] absolute lg:top-[18%] md:top-[20%] sm:top-[22%] top-[20%] w-[100%] flex items-center justify-center text-white font-bold px-2 sm:px-4 md:px-4 text-center leading-tight'>
                    Your Career Path
                </span>

                {/* Buttons Container - 768px follows mobile structure */}
                <div className='absolute lg:top-[30%] md:top-[75%] sm:top-[70%] top-[75%] w-[100%] flex items-center justify-center gap-2 sm:gap-3 md:gap-3 flex-wrap px-2 sm:px-4 md:px-4'>

                    {/* View All Courses Button - 768px with black background, no hover */}
                    <button 
                        onClick={handleViewCourses}
                        className='px-[12px] sm:px-[16px] md:px-[16px] py-[8px] sm:py-[10px] md:py-[10px] border-2 lg:border-white md:border-white md:bg-black sm:border-white border-black lg:text-white md:text-white sm:text-white text-black rounded-[8px] sm:rounded-[10px] md:rounded-[10px] text-[14px] sm:text-[16px] md:text-[16px] font-light flex gap-1 sm:gap-2 md:gap-2 cursor-pointer items-center justify-center min-w-[120px] sm:min-w-[140px] md:min-w-[140px]'>
                        <span className='whitespace-nowrap text-[12px] sm:text-[14px] md:text-[14px] lg:text-[18px]'>View All Courses</span>
                        <SiViaplay className='w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] md:w-[22px] md:h-[22px] lg:w-[30px] lg:h-[30px] lg:fill-white md:fill-white sm:fill-white fill-black' />
                    </button>

                    {/* Search with AI Button - 768px optimized colors */}
                    <button className='px-[12px] sm:px-[16px] md:px-[16px] py-[8px] sm:py-[10px] md:py-[10px] lg:bg-white md:bg-white sm:bg-white bg-black lg:text-black md:text-black sm:text-black text-white rounded-[8px] sm:rounded-[10px] md:rounded-[10px] text-[14px] sm:text-[16px] md:text-[16px] font-light flex gap-1 sm:gap-2 md:gap-2 cursor-pointer items-center justify-center hover:bg-gray-100 hover:text-black transition-all duration-300 min-w-[120px] sm:min-w-[140px] md:min-w-[140px]'>
                        <span className='whitespace-nowrap text-[12px] sm:text-[14px] md:text-[14px] lg:text-[18px]'>Search with AI</span>

                        {/* AI Icon for Large and Medium (768px) screens */}
                        <img
                            src={ai}
                            className='w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] md:w-[22px] md:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full hidden md:block'
                            alt=""
                        />

                        {/* AI Icon for Small and Mobile screens */}
                        <img
                            src={ai1}
                            className='w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] rounded-full md:hidden'
                            alt=""
                        />
                    </button>
                </div>
            </div>
            <Logos/>
            <ExploreCourses/>
            <CardPage/>
        </div>
    );
}

export default HomePage;