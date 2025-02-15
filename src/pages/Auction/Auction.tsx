import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  DollarSign,
  Percent,
  Package,
  Award,
  History,
  TrendingUp,
  Crown,
  Briefcase,
  Building2,
  GraduationCap,
  Rocket
} from 'lucide-react';
import AuctionTutorialModal from '../../components/Modals/AuctionTutorialModal';
import { ApplicationContext } from '../../App';

interface Bid {
  companyId: string;
  amount: number;
  timestamp: string;
}

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface AuctionStage {
  id: number;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  unit: string;
}

const stageColors = {
  salary: 'emerald',
  equity: 'blue',
  benefits: 'purple',
  position: 'amber'
};

const stages: AuctionStage[] = [
  {
    id: 1,
    name: 'salary',
    description: 'Base salary bidding',
    icon: <DollarSign className="w-6 h-6" />,
    color: stageColors.salary,
    unit: '₽'
  },
  {
    id: 2,
    name: 'equity',
    description: 'Company equity percentage',
    icon: <Percent className="w-6 h-6" />,
    color: stageColors.equity,
    unit: '%'
  },
  {
    id: 3,
    name: 'benefits',
    description: 'Social benefits package',
    icon: <Package className="w-6 h-6" />,
    color: stageColors.benefits,
    unit: ''
  },
  {
    id: 4,
    name: 'position',
    description: 'Job position and level',
    icon: <Award className="w-6 h-6" />,
    color: stageColors.position,
    unit: ''
  }
];

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'InnoSoft',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3624?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'DataFlow',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3625?w=100&h=100&fit=crop'
  }
];

const positionLevels = [
  { level: 'Intern', color: 'from-gray-500 to-gray-600' },
  { level: 'Junior', color: 'from-emerald-500 to-emerald-600' },
  { level: 'Middle', color: 'from-blue-500 to-blue-600' },
  { level: 'Senior', color: 'from-purple-500 to-purple-600' },
  { level: 'Lead', color: 'from-pink-500 to-pink-600' },
  { level: 'Head', color: 'from-amber-500 to-amber-600' },
  { level: 'Director', color: 'from-red-500 to-red-600' },
  { level: 'VP', color: 'from-indigo-500 to-indigo-600' },
  { level: 'CTO', color: 'from-cyan-500 to-cyan-600' }
];

const benefitsOptions = [
  'Медицинская страховка',
  'Стоматологическая страховка',
  'Страхование жизни',
  'Оплачиваемый отпуск 28 дней',
  'Оплачиваемый больничный',
  'Гибкий график',
  'Удаленная работа',
  'Корпоративный транспорт',
  'Питание в офисе',
  'Фитнес-зал',
  'Обучение и развитие',
  'Корпоративные мероприятия',
  'Скидки на продукты компании',
  'Акции компании',
  'Бонусы и премии'
];

const Auction = () => {
  const { t } = useTranslation();
  const { applicationCount } = useContext(ApplicationContext);
  const [countdown, setCountdown] = useState<number>(30);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageTime, setStageTime] = useState<number>(60);
  const [companyTurn, setCompanyTurn] = useState<number>(0);
  const [companyTime, setCompanyTime] = useState<number>(10);
  const [bidInput, setBidInput] = useState<string>('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [bids, setBids] = useState<{ [key: string]: Bid[] }>({
    salary: [],
    equity: [],
    benefits: [],
    position: []
  });
  const [showResults, setShowResults] = useState<boolean>(false);
  const [auctionStarted, setAuctionStarted] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);
  const [currentStageRef, setCurrentStageRef] = useState<number>(0);

  useEffect(() => {
    if (applicationCount >= 3 && tutorialCompleted && countdown > 0 && !auctionStarted) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0 && !auctionStarted) {
      setAuctionStarted(true);
    }
  }, [countdown, auctionStarted, applicationCount, tutorialCompleted]);

  useEffect(() => {
    if (auctionStarted && currentStage < stages.length) {
      const stageTimer = setInterval(() => {
        setStageTime(prev => {
          if (prev <= 0) {
            clearInterval(stageTimer);
            setCurrentStageRef(currentStage);
            setCurrentStage(current => current + 1);
            setStageTime(60);
            setCompanyTurn(0);
            setCompanyTime(10);
            setBidInput('');
            setSelectedBenefits([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const companyTimer = setInterval(() => {
        setCompanyTime(prev => {
          if (prev <= 0) {
            setCompanyTurn(current => {
              if (current >= mockCompanies.length - 1) {
                return 0;
              }
              return current + 1;
            });
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(stageTimer);
        clearInterval(companyTimer);
      };
    } else if (currentStage >= stages.length) {
      setShowResults(true);
    }
  }, [auctionStarted, currentStage, stageTime, companyTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStageBids = () => {
    switch (currentStage) {
      case 0:
        return bids.salary;
      case 1:
        return bids.equity;
      case 2:
        return bids.benefits;
      case 3:
        return bids.position;
      default:
        return [];
    }
  };

  const handleBid = (companyId: string, amount: number) => {
    const newBid: Bid = {
      companyId,
      amount: currentStage === 2 ? selectedBenefits.length : amount,
      timestamp: new Date().toISOString()
    };

    switch (currentStage) {
      case 0:
        setBids(prev => ({ ...prev, salary: [...prev.salary, newBid] }));
        setBidInput('');
        break;
      case 1:
        setBids(prev => ({ ...prev, equity: [...prev.equity, newBid] }));
        setBidInput('');
        break;
      case 2:
        setBids(prev => ({ ...prev, benefits: [...prev.benefits, newBid] }));
        setSelectedBenefits([]);
        break;
      case 3:
        setBids(prev => ({ ...prev, position: [...prev.position, newBid] }));
        setBidInput('');
        break;
    }
  };

  if (applicationCount < 3) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <Briefcase className="w-8 h-8 text-emerald-400" />
              <Building2 className="w-8 h-8 text-blue-400" />
              <GraduationCap className="w-8 h-8 text-purple-400" />
              <Rocket className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Not Enough Applications
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              You need to apply to at least 3 positions before participating in the auction.
              <br />
              Currently applied to: {applicationCount} positions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-${stageColors[stage.name]}-500/20`}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${stageColors[stage.name]}-500/10 flex items-center justify-center`}>
                    {stage.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{stage.name}</h3>
                  <p className="text-sm text-gray-400">{stage.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionStarted) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <Briefcase className="w-8 h-8 text-emerald-400" />
              <Building2 className="w-8 h-8 text-blue-400" />
              <GraduationCap className="w-8 h-8 text-purple-400" />
              <Rocket className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Talent Auction
            </h1>
            <p className="text-xl text-gray-400">
              Companies are competing for your skills
            </p>
          </div>

          {tutorialCompleted && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4 text-6xl font-mono font-bold text-emerald-400 mb-6">
                <Timer className="w-12 h-12" />
                <span>{countdown}</span>
              </div>
              <p className="text-gray-300 text-lg">
                The auction will begin shortly. Get ready to receive competitive offers from top companies!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-${stageColors[stage.name]}-500/20`}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${stageColors[stage.name]}-500/10 flex items-center justify-center`}>
                  {stage.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{stage.name}</h3>
                <p className="text-sm text-gray-400">{stage.description}</p>
              </motion.div>
            ))}
          </div>

          <AuctionTutorialModal
            isOpen={showTutorial}
            onClose={() => {
              setShowTutorial(false);
              setTutorialCompleted(true);
            }}
          />
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Auction Results</h2>
              <Crown className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-8">
              {mockCompanies.map(company => (
                <div
                  key={company.id}
                  className="bg-gray-700 rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <h3 className="text-xl font-semibold text-white">
                      {company.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stages.map(stage => {
                      const latestBid = bids[stage.name]
                        ?.filter(bid => bid.companyId === company.id)
                        .pop();

                      return (
                        <div
                          key={stage.id}
                          className="bg-gray-800 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 text-gray-400 mb-2">
                            {stage.icon}
                            <span>{stage.name}</span>
                          </div>
                          <div className={`text-${stageColors[stage.name]}-400 font-mono font-bold`}>
                            {latestBid
                              ? stage.name === 'benefits'
                                ? `${latestBid.amount} льгот`
                                : stage.name === 'position'
                                  ? positionLevels[latestBid.amount - 1]?.level || 'Unknown'
                                  : `${latestBid.amount}${stage.unit}`
                              : 'No bid'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Company Recommendation */}
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-emerald-500/20">
                    <h4 className="text-emerald-400 font-semibold mb-2">AI Recommendation</h4>
                    <p className="text-gray-300">
                      {(() => {
                        const salaryBid = bids.salary?.find(b => b.companyId === company.id)?.amount || 0;
                        const equityBid = bids.equity?.find(b => b.companyId === company.id)?.amount || 0;
                        const benefitsBid = bids.benefits?.find(b => b.companyId === company.id)?.amount || 0;
                        const positionBid = bids.position?.find(b => b.companyId === company.id)?.amount || 0;
                        
                        const score = (salaryBid / 100000) + (equityBid * 2) + (benefitsBid / 3) + (positionBid * 2);
                        
                        if (score > 15) return 'Excellent offer with strong compensation and growth potential';
                        if (score > 10) return 'Good balanced offer with competitive benefits';
                        if (score > 5) return 'Decent offer with room for negotiation';
                        return 'Consider other offers with better terms';
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  // Here you would handle the selection and redirect to chat
                  // For now, let's just log the selection
                  console.log('Offer selected');
                }}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Choose Offer
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stage Progress */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={false}
                animate={{
                  scale: currentStage === index ? 1.05 : 1,
                  y: currentStage === index ? -4 : 0
                }}
                className={`flex-1 ${index > 0 ? 'ml-2' : ''}`}
              >
                <div
                  className={`rounded-lg p-4 transition-all duration-300 ${
                    currentStage === index
                      ? `bg-${stageColors[stage.name]}-600 shadow-lg shadow-${stageColors[stage.name]}-500/20 border-2 border-${stageColors[stage.name]}-400`
                      : currentStage > index
                      ? `bg-${stageColors[stage.name]}-900/50 opacity-50`
                      : 'bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{
                        rotate: currentStage === index ? [0, -10, 10, 0] : 0
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: currentStage === index ? Infinity : 0,
                        repeatDelay: 2
                      }}
                    >
                      {stage.icon}
                    </motion.div>
                    <span className={`font-medium text-white ${
                      currentStage === index ? 'text-lg' : 'text-base'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                  {currentStage === index && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 text-sm text-${stageColors[stage.name]}-200 text-center`}
                    >
                      Current Stage
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Timer Bar */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span>Stage Time:</span>
                <span className="font-mono font-bold text-white">
                  {formatTime(stageTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span>Company Time:</span>
                <span className="font-mono font-bold text-white">
                  {formatTime(companyTime)}
                </span>
              </div>
            </div>
            
            {/* Stage Progress Bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(stageTime / 60) * 100}%` }}
                className={`h-full bg-${stageColors[stages[currentStage].name]}-500`}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Companies */}
          <div className="lg:col-span-2 space-y-6">
            {mockCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800 rounded-lg p-6 ${
                  companyTurn === index ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <h3 className="text-xl font-semibold text-white">
                      {company.name}
                    </h3>
                  </div>
                  {companyTurn === index && (
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm">
                      Current Turn
                    </span>
                  )}
                </div>

                {currentStage === 3 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {positionLevels.map(({ level, color }) => (
                      <button
                        key={level}
                        onClick={() =>
                          companyTurn === index &&
                          handleBid(company.id, positionLevels.indexOf(positionLevels.find(l => l.level === level)!) + 1)
                        }
                        disabled={companyTurn !== index}
                        className={`bg-gradient-to-r ${color} p-2 rounded text-white text-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                ) : currentStage === 2 ? (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {benefitsOptions.map((benefit) => (
                        <label
                          key={benefit}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            selectedBenefits.includes(benefit)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBenefits.includes(benefit)}
                            onChange={() => {
                              if (companyTurn === index) {
                                setSelectedBenefits(prev =>
                                  prev.includes(benefit)
                                    ? prev.filter(b => b !== benefit)
                                    : [...prev, benefit]
                                );
                              }
                            }}
                            className="hidden"
                            disabled={companyTurn !== index}
                          />
                          <span>{benefit}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => companyTurn === index && handleBid(company.id, selectedBenefits.length)}
                      disabled={companyTurn !== index || selectedBenefits.length === 0}
                      className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600"
                    >
                      Предложить выбранные льготы
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={bidInput}
                      onChange={(e) => setBidInput(e.target.value)}
                      placeholder={`Enter ${stages[currentStage].name}`}
                      className="flex-grow px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={companyTurn !== index}
                    />
                    <button
                      onClick={() => companyTurn === index && handleBid(company.id, parseInt(bidInput))}
                      disabled={companyTurn !== index || !bidInput}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600"
                    >
                      Bid
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bid History */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 text-white mb-4">
              <History className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Bid History</h3>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {getCurrentStageBids()
                .slice()
                .reverse()
                .map((bid, index) => {
                  const company = mockCompanies.find(c => c.id === bid.companyId);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={company?.logo}
                            alt={company?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-white">{company?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-mono font-bold">
                            {currentStage === 2 
                              ? `${bid.amount} льгот`
                              : currentStage === 3
                                ? positionLevels[bid.amount - 1]?.level || 'Unknown'
                                : `${bid.amount}${stages[currentStage].unit}`
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;