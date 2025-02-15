import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  TrainIcon,
  BriefcaseIcon,
  ClockIcon,
  BanknoteIcon,
  ChevronDownIcon,
  XIcon,
  CalendarIcon,
} from "lucide-react";
import jobsData from "../../data/jobs.json";
import ApplicationModal from "../../components/Modals/ApplicationModal";
import { ApplicationContext } from "../../App";

// Add new imports
import { Message } from "../../types/chat";

interface FilterState {
  city: string;
  metro: string;
  experienceRange: [number, number];
  salaryRange: [number, number];
  employmentType: string[];
  schedule: string[];
  sideWork: string[];
  sortBy: string;
  timeFrame: string;
  perPage: number;
}

const Jobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applicationCount, setApplicationCount } = useContext(ApplicationContext);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    city: "",
    metro: "",
    experienceRange: [0, 10],
    salaryRange: [50000, 300000],
    employmentType: [],
    schedule: [],
    sideWork: [],
    sortBy: "relevance",
    timeFrame: "all",
    perPage: 20,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Mock resumes data for the application modal
  const mockResumes = [
    { id: "1", title: "Software Developer Resume" },
    { id: "2", title: "Frontend Developer Resume" },
  ];

  // Function to get existing chats from localStorage
  const getExistingChats = () => {
    const chats = localStorage.getItem('chats');
    return chats ? JSON.parse(chats) : {};
  };

  // Function to save chats to localStorage
  const saveChats = (chats: any) => {
    localStorage.setItem('chats', JSON.stringify(chats));
  };

  const handleApplicationSubmit = async (data: {
    resumeId: string;
    coverLetter: string;
    resumeFile?: File;
  }) => {
    // Get the selected job
    const selectedJob = jobsData.jobs.find(job => job.id.toString() === selectedJobId);
    if (!selectedJob) return;

    // Create a unique chat ID
    const chatId = `chat_${Date.now()}`;

    // Create initial messages
    const initialMessages: Message[] = [
      {
        id: Date.now().toString(),
        senderId: "currentUser",
        type: "resume",
        content: data.resumeFile
          ? data.resumeFile.name
          : `Resume #${data.resumeId}`,
        timestamp: new Date().toISOString(),
        metadata: {
          resumeId: data.resumeId
        }
      },
      {
        id: (Date.now() + 1).toString(),
        senderId: "currentUser",
        type: "coverLetter",
        content: data.coverLetter,
        timestamp: new Date().toISOString()
      }
    ];

    // Create chat data
    const chatData = {
      id: chatId,
      companyId: selectedJob.id,
      companyName: selectedJob.company,
      jobTitle: selectedJob.title,
      messages: initialMessages,
      lastMessage: "Application sent",
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    // Get existing chats and add the new one
    const existingChats = getExistingChats();
    existingChats[chatId] = chatData;
    saveChats(existingChats);

    // Update application count
    setApplicationCount((prev) => prev + 1);

    // Navigate to the chat
    navigate(`/chat/${chatId}`);
    setShowApplicationModal(false);
  };

  const employmentTypeOptions = [
    { value: "fulltime", label: t("jobs.filters.employmentType.fulltime") },
    { value: "parttime", label: t("jobs.filters.employmentType.parttime") },
    { value: "contract", label: t("jobs.filters.employmentType.contract") },
    { value: "temporary", label: t("jobs.filters.employmentType.temporary") },
    { value: "remote", label: t("jobs.filters.employmentType.remote") },
  ];

  const scheduleOptions = [
    { value: "fullday", label: t("jobs.filters.schedule.fullday") },
    { value: "flexiblehours", label: t("jobs.filters.schedule.flexiblehours") },
    { value: "shiftwork", label: t("jobs.filters.schedule.shiftwork") },
    { value: "nightshifts", label: t("jobs.filters.schedule.nightshifts") },
  ];

  const sideWorkOptions = [
    { value: "onetimetask", label: t("jobs.filters.sideWork.onetimetask") },
    { value: "parttime", label: t("jobs.filters.sideWork.parttime") },
    {
      value: "atleast4hoursaday",
      label: t("jobs.filters.sideWork.atleast4hoursaday"),
    },
    { value: "onweekends", label: t("jobs.filters.sideWork.onweekends") },
    { value: "intheevenings", label: t("jobs.filters.sideWork.intheevenings") },
  ];

  const sortOptions = [
    { value: "relevance", label: t("jobs.sort.relevance") },
    { value: "date", label: t("jobs.sort.date") },
    { value: "salary-desc", label: t("jobs.sort.salaryDesc") },
    { value: "salary-asc", label: t("jobs.sort.salaryAsc") },
  ];

  const timeFrameOptions = [
    { value: "all", label: t("jobs.timeFrame.all") },
    { value: "month", label: t("jobs.timeFrame.month") },
    { value: "week", label: t("jobs.timeFrame.week") },
    { value: "threeDays", label: t("jobs.timeFrame.threeDays") },
    { value: "day", label: t("jobs.timeFrame.day") },
  ];

  const perPageOptions = [10, 20, 50];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item: string) => item !== value)
        : [...prev[key], value],
    }));
    setCurrentPage(1);
  };

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : "",
    }));
  };

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t("jobs.timeFrame.day");
    if (days === 1) return t("jobs.timeFrame.threeDays");
    if (days < 7) return t("jobs.timeFrame.week");
    if (days < 30) return t("jobs.timeFrame.month");
    return t("jobs.timeFrame.all");
  };

  // Filter and sort jobs
  const filteredJobs = jobsData.jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity =
        !filters.city ||
        job.location.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchesMetro =
        !filters.metro ||
        job.location.metro.toLowerCase().includes(filters.metro.toLowerCase());
      const matchesSalary =
        job.salary.min >= filters.salaryRange[0] &&
        job.salary.max <= filters.salaryRange[1];
      const matchesExperience =
        job.experience >= filters.experienceRange[0] &&
        job.experience <= filters.experienceRange[1];
      const matchesEmploymentType =
        filters.employmentType.length === 0 ||
        filters.employmentType.includes(job.type);
      const matchesSchedule =
        filters.schedule.length === 0 ||
        filters.schedule.includes(job.schedule);

      return (
        matchesSearch &&
        matchesCity &&
        matchesMetro &&
        matchesSalary &&
        matchesExperience &&
        matchesEmploymentType &&
        matchesSchedule
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "date":
          return (
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          );
        case "salary-desc":
          return b.salary.max - a.salary.max;
        case "salary-asc":
          return a.salary.min - b.salary.min;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / filters.perPage);
  const startIndex = (currentPage - 1) * filters.perPage;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + filters.perPage
  );

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];

    if (filters.city) {
      active.push({
        type: "city",
        label: t("jobs.activeFilters.city", { city: filters.city }),
        icon: <MapPinIcon className="w-4 h-4" />,
      });
    }

    if (filters.metro) {
      active.push({
        type: "metro",
        label: t("jobs.activeFilters.metro", { metro: filters.metro }),
        icon: <TrainIcon className="w-4 h-4" />,
      });
    }

    if (filters.experienceRange[1] < 10) {
      active.push({
        type: "experience",
        label: t("jobs.activeFilters.experience", {
          years: filters.experienceRange[1],
        }),
        icon: <BriefcaseIcon className="w-4 h-4" />,
      });
    }

    if (filters.salaryRange[1] < 300000) {
      active.push({
        type: "salary",
        label: t("jobs.activeFilters.salary", {
          salary: formatSalary(filters.salaryRange[1]),
        }),
        icon: <BanknoteIcon className="w-4 h-4" />,
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="pt-20 bg-gray-900">
      {/* Search Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 bg-gray-900/50 rounded-lg p-2">
            <SearchIcon className="w-6 h-6 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder={t("jobs.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
            />
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              <FilterIcon className="w-5 h-5" />
              {t("jobs.search.filters")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={false}
            animate={{ width: isFiltersOpen ? 'auto' : 0 }}
            className={`${isFiltersOpen ? 'w-80' : 'w-0'} flex-shrink-0 overflow-hidden h-fit`}
          >
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* Location Filters */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.location.title")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{t("jobs.filters.location.city")}</span>
                    </div>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={t("jobs.filters.location.cityPlaceholder")}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <TrainIcon className="w-4 h-4" />
                      <span>{t("jobs.filters.location.metro")}</span>
                    </div>
                    <input
                      type="text"
                      value={filters.metro}
                      onChange={(e) =>
                        handleFilterChange("metro", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={t("jobs.filters.location.metroPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.experience.title")}
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.experienceRange[1]}
                    onChange={(e) =>
                      handleFilterChange("experienceRange", [
                        filters.experienceRange[0],
                        parseFloat(e.target.value),
                      ])
                    }
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-gray-400">
                    <span>{filters.experienceRange[0]}</span>
                    <span>{filters.experienceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.salary.title")}
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="50000"
                    max="300000"
                    step="10000"
                    value={filters.salaryRange[1]}
                    onChange={(e) =>
                      handleFilterChange("salaryRange", [
                        filters.salaryRange[0],
                        parseInt(e.target.value),
                      ])
                    }
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-gray-400">
                    <span>{formatSalary(filters.salaryRange[0])}</span>
                    <span>{formatSalary(filters.salaryRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.employmentType.title")}
                </h3>
                <div className="space-y-2">
                  {employmentTypeOptions.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.employmentType.includes(type.value)}
                        onChange={() =>
                          toggleFilter("employmentType", type.value)
                        }
                        className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                      />
                      <span className="text-gray-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.schedule.title")}
                </h3>
                <div className="space-y-2">
                  {scheduleOptions.map((schedule) => (
                    <label
                      key={schedule.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.schedule.includes(schedule.value)}
                        onChange={() =>
                          toggleFilter("schedule", schedule.value)
                        }
                        className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                      />
                      <span className="text-gray-300">{schedule.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Side Work */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t("jobs.filters.sideWork.title")}
                </h3>
                <div className="space-y-2">
                  {sideWorkOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.sideWork.includes(option.value)}
                        onChange={() => toggleFilter("sideWork", option.value)}
                        className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="w-full h-fit">
            {/* Sort and View Options */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Time Frame Dropdown */}
                  <div className="relative">
                    <select
                      value={filters.timeFrame}
                      onChange={(e) =>
                        handleFilterChange("timeFrame", e.target.value)
                      }
                      className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {timeFrameOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Per Page Dropdown */}
                <div className="relative">
                  <select
                    value={filters.perPage}
                    onChange={(e) =>
                      handleFilterChange("perPage", parseInt(e.target.value))
                    }
                    className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {perPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} {t("jobs.perPage.vacancies")}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {t("jobs.activeFilters.title")}
                  </h3>
                  <button
                    onClick={() => {
                      setFilters({
                        ...filters,
                        city: "",
                        metro: "",
                        experienceRange: [0, 10],
                        salaryRange: [50000, 300000],
                        employmentType: [],
                        schedule: [],
                        sideWork: [],
                      });
                    }}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    {t("jobs.activeFilters.clearAll")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-full"
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                      <button
                        onClick={() =>
                          clearFilter(filter.type as keyof FilterState)
                        }
                        className="text-gray-400 hover:text-white"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Cards */}
            <div className="space-y-6 mb-6">
              {paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {job.title}
                      </h3>
                      <p className="text-emerald-400 text-lg mb-2">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span>
                          {job.location.city} • {job.location.metro}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id.toString());
                        setShowApplicationModal(true);
                      }}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                      {t("jobs.card.applyNow")}
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{job.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <BanknoteIcon className="w-4 h-4" />
                      <span>
                        ₽{formatSalary(job.salary.min)} - ₽
                        {formatSalary(job.salary.max)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{job.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {t("jobs.card.posted")} {formatDate(job.postedDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {paginatedJobs.length > 0 && (
              <div className="flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("jobs.pagination.previous")}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === currentPage
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("jobs.pagination.next")}
                  </button>
                </nav>
              </div>
            )}

            {/* No Results */}
            {paginatedJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {t("jobs.activeFilters.noResults")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={handleApplicationSubmit}
        resumes={mockResumes}
      />
    </div>
  );
};

export default Jobs;