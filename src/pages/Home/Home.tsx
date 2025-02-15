import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  SearchIcon,
  TrendingUpIcon,
  UsersIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  StarIcon,
} from "lucide-react";

const companies = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    background: "bg-white",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    background: "bg-white",
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    background: "bg-white",
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    background: "bg-white",
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    background: "bg-white",
  },
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    background: "bg-white",
  },
];

const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const parallaxScroll = () => {
      const scrolled = window.scrollY;
      const hero = document.querySelector(".hero");
      if (hero) {
        hero.style.backgroundPositionY = `${-(scrolled * 0.5)}px`;
      }
    };

    window.addEventListener("scroll", parallaxScroll);
    return () => window.removeEventListener("scroll", parallaxScroll);
  }, []);

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
    <div className="pt-20 min-h-screen bg-gray-900">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 scale-110 transition-transform duration-500"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6 font-mono"
          >
            {t("home.hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-12 opacity-90"
          >
            {t("home.hero.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-md rounded-lg p-2 max-w-2xl mx-auto"
          >
            <SearchIcon className="w-6 h-6 ml-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("home.hero.searchPlaceholder")}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg px-4"
            />
            <button className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors hover:scale-105 transform duration-200">
              {t("home.hero.search")}
            </button>
          </motion.div>
        </div>

        <div className="flex justify-center gap-12 px-8 py-8 bg-gray-800 rounded-lg w-auto mx-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h3 className="text-4xl font-bold mb-2 font-mono text-emerald-400">
              5000+
            </h3>
            <p className="text-sm text-gray-300">{t("home.stats.jobs")}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <h3 className="text-4xl font-bold mb-2 font-mono text-emerald-400">
              10000+
            </h3>
            <p className="text-sm text-gray-300">{t("home.stats.students")}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h3 className="text-4xl font-bold mb-2 font-mono text-emerald-400">
              1000+
            </h3>
            <p className="text-sm text-gray-300">{t("home.stats.companies")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-800">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 border border-gray-700"
          >
            <TrendingUpIcon className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t("home.features.jobs.title")}
            </h3>
            <p className="text-gray-400">
              {t("home.features.jobs.description")}
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 border border-gray-700"
          >
            <UsersIcon className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t("home.features.students.title")}
            </h3>
            <p className="text-gray-400">
              {t("home.features.students.description")}
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 border border-gray-700"
          >
            <BriefcaseIcon className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t("home.features.opportunities.title")}
            </h3>
            <p className="text-gray-400">
              {t("home.features.opportunities.description")}
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 border border-gray-700"
          >
            <GraduationCapIcon className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t("home.features.education.title")}
            </h3>
            <p className="text-gray-400">
              {t("home.features.education.description")}
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-4 bg-gray-900">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          {t("home.howItWorks.title")}
        </motion.h2>
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step * 0.2 }}
              className="flex-1 text-center p-8"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">
                {t(`home.howItWorks.step${step}.title`)}
              </h3>
              <p className="text-gray-400">
                {t(`home.howItWorks.step${step}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-800">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-6 text-white"
        >
          {t("home.companies.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl text-center mb-16 text-gray-400"
        >
          {t("home.companies.subtitle")}
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto items-center justify-items-center">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 bg-gray-900 w-full h-24`}
            >
              <img
                src={company.logo}
                alt={company.name}
                className="max-w-full max-h-full object-contain opacity-75 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-900">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          {t("home.testimonials.title")}
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-emerald-400" />
                ))}
              </div>
              <p className="text-gray-300">
                {t(`home.testimonials.testimonial${index}`)}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={`https://i.pravatar.cc/100?img=${index + 10}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {t(`home.testimonials.author${index}.name`)}
                  </h4>
                  <p className="text-gray-400">
                    {t(`home.testimonials.author${index}.role`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">{t("home.cta.title")}</h2>
          <p className="text-xl mb-8 text-gray-300">
            {t("home.cta.description")}
          </p>
          <button className="px-12 py-4 bg-emerald-500 text-white rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors hover:scale-105 transform duration-200">
            {t("home.cta.button")}
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
