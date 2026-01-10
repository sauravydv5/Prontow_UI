import { AdminLayout } from "@/components/AdminLayout";
import { GameCard } from '@/components/GameCard';
import { useNavigate } from "react-router-dom";
import spinImage from '@/images/spin-the-wheel.png';
import opinioImage from '@/images/opinio.png';
import { motion } from "framer-motion";

function Games() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <AdminLayout title="Games">
      <motion.div
        className="flex flex-wrap justify-center gap-12 p-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <GameCard title="Spin The Wheel" bgColor="bg-teal-600" onClick={() => navigate('/games/spin-the-wheel')}>
            <img src={spinImage} alt="Spin The Wheel Icon" className="w-20 h-20 mb-2" />
          </GameCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GameCard title="Opinio" bgColor="bg-teal-700" onClick={() => navigate('/games/opinio')}>
            <img src={opinioImage} alt="Opinio Icon" className="w-20 h-20 mb-2" />
          </GameCard>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

export default Games;