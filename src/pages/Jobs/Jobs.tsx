import React, { useState, useEffect } from "react";
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
import ApplicationModal from "../../components/Modals/ApplicationModal";

// Types
interface Country {
  id: number;
  title: string;
}

interface Region {
  id: number;
  title: string;
  country: Country;
}

interface District {
  id: number;
  title: string;
  region: Region;
}

interface Creator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  phone: string;
  gender: string | null;
  img: string;
  birthday: string;
  country: Country | null;
  region: Region | null;
  district: District | null;
  place_of_education: string | null;
  publish_phone: boolean;
  public_status: boolean;
}

interface Company {
  id: number;
  title: string;
  logo: string;
  description: string;
  creator: Creator;
  country: Country;
}

interface Vacancy {
  id: number;
  title: string;
  description: string;
  salary: number;
  currency: string;
  date_of_create: string;
  responses: number;
  country: Country;
  region: Region;
  district: District;
  company: Company;
  experience: string;
  education: string;
  employment: string;
  is_publish: boolean;
}

interface VacanciesResponse {
  vacancies: Vacancy[];
}

interface FilterParams {
  title?: string;
  salary?: string;
  currency?: string;
  country?: string;
  region?: string;
  district?: string;
  experience?: string;
  education?: string;
  employment?: string;
}

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

interface Message {
  id: string;
  senderId: string;
  type: string;
  content: string;
  timestamp: string;
  metadata?: {
    resumeId: string;
  };
}

// API Functions
const API_URL = "http://127.0.0.1:8000";

async function fetchVacancies(): Promise<VacanciesResponse> {
  const response = await fetch(`${API_URL}/vacancies/`);
  if (!response.ok) {
    throw new Error("Failed to fetch vacancies");
  }
  return response.json();
}

async function filterVacancies(
  params: FilterParams
): Promise<VacanciesResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/filter_vacancies/?${queryParams}`);
  if (!response.ok) {
    throw new Error("Failed to filter vacancies");
  }
  return response.json();
}

async function applyToVacancy(id: number, message: string): Promise<void> {
  const response = await fetch(`${API_URL}/vacancy/${id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to apply for vacancy");
  }
}

// Main Jobs Component
export function Jobs() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(
    null
  );

  // Mock resumes data for the application modal
  const mockResumes = [
    { id: "1", title: "Software Developer Resume" },
    { id: "2", title: "Frontend Developer Resume" },
  ];

  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const response = await fetchVacancies();
      setVacancies(response.vacancies);
      setError(null);
    } catch (err) {
      setError("Failed to load vacancies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const apiFilters: FilterParams = {
        title: searchQuery,
        salary: filters.salaryRange[1].toString(),
        employment: filters.employmentType.join(","),
        experience: filters.experienceRange[1].toString(),
      };

      const response = await filterVacancies(apiFilters);
      setVacancies(response.vacancies);
      setError(null);
    } catch (err) {
      setError("Failed to filter vacancies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get existing chats from localStorage
  const getExistingChats = () => {
    const chats = localStorage.getItem("chats");
    return chats ? JSON.parse(chats) : {};
  };

  // Function to save chats to localStorage
  const saveChats = (chats: any) => {
    localStorage.setItem("chats", JSON.stringify(chats));
  };

  const handleApplicationSubmit = async (data: {
    resumeId: string;
    coverLetter: string;
    resumeFile?: File;
  }) => {
    if (!selectedVacancyId) return;

    try {
      // Apply to vacancy through API
      await applyToVacancy(selectedVacancyId, data.coverLetter);

      // Get the selected vacancy
      const selectedVacancy = vacancies.find(
        (vacancy) => vacancy.id === selectedVacancyId
      );
      if (!selectedVacancy) return;

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
            resumeId: data.resumeId,
          },
        },
        {
          id: (Date.now() + 1).toString(),
          senderId: "currentUser",
          type: "coverLetter",
          content: data.coverLetter,
          timestamp: new Date().toISOString(),
        },
      ];

      // Create chat data
      const chatData = {
        id: chatId,
        companyId: selectedVacancy.id,
        companyName: selectedVacancy.company.title,
        jobTitle: selectedVacancy.title,
        messages: initialMessages,
        lastMessage: "Application sent",
        timestamp: new Date().toISOString(),
        status: "active",
      };

      // Get existing chats and add the new one
      const existingChats = getExistingChats();
      existingChats[chatId] = chatData;
      saveChats(existingChats);

      // Refresh vacancies to update response count
      await loadVacancies();

      setShowApplicationModal(false);

      // Show success message or redirect
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Failed to apply:", err);
      alert("Failed to submit application. Please try again.");
    }
  };

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

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Options for filters
  const employmentTypeOptions = [
    { value: "fulltime", label: "Full Time" },
    { value: "parttime", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
    { value: "remote", label: "Remote" },
  ];

  const scheduleOptions = [
    { value: "fullday", label: "Full Day" },
    { value: "flexiblehours", label: "Flexible Hours" },
    { value: "shiftwork", label: "Shift Work" },
    { value: "nightshifts", label: "Night Shifts" },
  ];

  const sideWorkOptions = [
    { value: "onetimetask", label: "One-time Task" },
    { value: "parttime", label: "Part Time" },
    { value: "atleast4hoursaday", label: "At least 4 hours a day" },
    { value: "onweekends", label: "On Weekends" },
    { value: "intheevenings", label: "In the Evenings" },
  ];

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "date", label: "Newest" },
    { value: "salary-desc", label: "Highest Salary" },
    { value: "salary-asc", label: "Lowest Salary" },
  ];

  const timeFrameOptions = [
    { value: "all", label: "All Time" },
    { value: "month", label: "Past Month" },
    { value: "week", label: "Past Week" },
    { value: "threeDays", label: "Past 3 Days" },
    { value: "day", label: "Past 24 Hours" },
  ];

  const perPageOptions = [10, 20, 50];

  // Pagination
  const paginatedVacancies = vacancies.slice(
    (currentPage - 1) * filters.perPage,
    currentPage * filters.perPage
  );
  const totalPages = Math.ceil(vacancies.length / filters.perPage);

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];

    if (filters.city) {
      active.push({
        type: "city",
        label: `City: ${filters.city}`,
        icon: <MapPinIcon className="w-4 h-4" />,
      });
    }

    if (filters.metro) {
      active.push({
        type: "metro",
        label: `Metro: ${filters.metro}`,
        icon: <TrainIcon className="w-4 h-4" />,
      });
    }

    if (filters.experienceRange[1] < 10) {
      active.push({
        type: "experience",
        label: `Experience: ${filters.experienceRange[1]} years`,
        icon: <BriefcaseIcon className="w-4 h-4" />,
      });
    }

    if (filters.salaryRange[1] < 300000) {
      active.push({
        type: "salary",
        label: `Salary: ${formatSalary(filters.salaryRange[1])}`,
        icon: <BanknoteIcon className="w-4 h-4" />,
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-900">
      {/* Search Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 bg-gray-900/50 rounded-lg p-2">
            <SearchIcon className="w-6 h-6 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search for jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
            />
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              <FilterIcon className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={false}
            animate={{ width: isFiltersOpen ? "auto" : 0 }}
            className={`${
              isFiltersOpen ? "w-80" : "w-0"
            } flex-shrink-0 overflow-hidden h-fit`}
          >
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* Location Filters */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Location
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>City</span>
                    </div>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <TrainIcon className="w-4 h-4" />
                      <span>Metro</span>
                    </div>
                    <input
                      type="text"
                      value={filters.metro}
                      onChange={(e) =>
                        handleFilterChange("metro", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter metro station"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Experience
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
                  Salary
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
                  Employment Type
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
                  Schedule
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
                  Side Work
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
                        {option} vacancies
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
                    Active Filters
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
                    Clear All
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

            {/* Vacancies List */}
            <div className="space-y-6 mb-6">
              {paginatedVacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={`${API_URL}${vacancy.company.logo}`}
                        alt={vacancy.company.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {vacancy.title}
                        </h3>
                        <p className="text-emerald-400 text-lg mb-2">
                          {vacancy.company.title}
                        </p>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {vacancy.country.title}, {vacancy.region.title},{" "}
                            {vacancy.district.title}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVacancyId(vacancy.id);
                        setShowApplicationModal(true);
                      }}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300">{vacancy.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{vacancy.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <BanknoteIcon className="w-4 h-4" />
                      <span>
                        {vacancy.salary} {vacancy.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{vacancy.employment}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{vacancy.education}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Posted {formatDate(vacancy.date_of_create)}</span>
                    </div>
                    <div>{vacancy.responses} responses</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {paginatedVacancies.length > 0 && (
              <div className="flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
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
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* No Results */}
            {paginatedVacancies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No vacancies found</p>
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
}

export default Jobs;
