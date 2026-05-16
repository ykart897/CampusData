import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type ScoreType = "SAY" | "EA" | "SOZ" | "DIL" | "TYT";
export type TeachingType = "ORGUNLU" | "IKINDI" | "UZAKTAN";
export type UniversityType = "DEVLET" | "VAKIF" | "VAKIF_UCRETLI";

export type UniversitySummary = {
  id: number;
  name: string;
  city: string | null;
  type: UniversityType | string;
};

export type University = UniversitySummary & {
  region?: string;
  foundingYear?: number | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  studentCount?: number | null;
  facultyCount?: number | null;
  dormCapacity?: number | null;
  dataYear?: number | null;
  bachelorProgramCount?: number | null;
  facultyProgramUnitCount?: number | null;
  totalQuota?: number | null;
  totalPlaced?: number | null;
  occupancyRate?: number | null;
  bestBaseRank?: number | null;
  highestBaseScore?: number | null;
  scoreTypeDistribution?: Record<string, number>;
  teachingTypeDistribution?: Record<string, number>;
};

export type NearbyPlaceCategory = "cafe" | "food" | "dormitory" | "market" | "transport" | "library";

export type NearbyPlace = {
  id?: number;
  name: string;
  category: NearbyPlaceCategory;
  lat: number;
  lng: number;
  distanceMeters: number;
  source?: string;
  sourceDate?: string;
  externalId?: string | null;
};

export type UniversityMapData = {
  universityId?: number;
  universityName: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
  source: string;
  sourceDate: string;
  confidence?: string;
  places: NearbyPlace[];
};

export type YearData = {
  year: number;
  baseScore: number | null;
  baseRank: number | null;
  ceilingScore: number | null;
  ceilingRank: number | null;
  placed: number | null;
  remaining: number | null;
  yearQuota: number | null;
  registered: number | null;
  additionalPlaced: number | null;
  additionalRegistered: number | null;
};

export type BachelorProgramSummary = {
  id: number;
  programName: string;
  faculty: string;
  scoreType: Exclude<ScoreType, "TYT">;
  teachingType: TeachingType | null;
  quota: number;
  scholarshipRate: number;
  programCode: string | null;
  language: string | null;
  educationDurationYears: number | null;
  detailUrl: string | null;
  programGroupName: string | null;
  unitTypeName: string | null;
  educationTypeName: string | null;
  scholarshipRateName: string | null;
  university: UniversitySummary;
  latestYearData: YearData | null;
};

export type BachelorProgramDetail = Omit<BachelorProgramSummary, "latestYearData"> & {
  tuitionFee: number | null;
  yokatlasUniversityId: number | null;
  yokatlasCityCode: string | null;
  yokatlasProgramGroupId: string | null;
  unitTypeId: number | null;
  educationTypeId: number | null;
  scholarshipRateId: number | null;
  osymGuideId: number | null;
  previousGuideCode: string | null;
  previousUnitId: number | null;
  fymkId: number | null;
  fymkCityName: string | null;
  fymkDistrictName: string | null;
  districtName: string | null;
  accreditation: string | null;
  accreditationDescription: string | null;
  universityAccreditation: string | null;
  conditions: string | null;
  minimumSuccessRank: number | null;
  minimumSuccessRankCondition: string | null;
  quotaY34: number | null;
  quotaDep: number | null;
  quotaMeb: number | null;
  quotaObs: number | null;
  quotaSgy: number | null;
  placementY34: number | null;
  placementDep: number | null;
  placementObs: number | null;
  placementSgy: number | null;
  tyc: string | null;
  appliedEducationModel: string | null;
  femaleCount: number | null;
  maleCount: number | null;
  newGraduateCount: number | null;
  oldGraduateCount: number | null;
  netAverages: Array<Record<string, unknown>>;
  professorCount: number | null;
  associateProfessorCount: number | null;
  doctorFacultyMemberCount: number | null;
  lecturerCount: number | null;
  researchAssistantCount: number | null;
  yearlyData: YearData[];
};

export type PagedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type BachelorFilter = {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  universityId?: number;
  universityType?: string;
  scoreType?: string;
  teachingType?: string;
  minQuota?: number;
  maxQuota?: number;
  minRank?: number;
  maxRank?: number;
  minBaseScore?: number;
  maxBaseScore?: number;
  year?: number;
  sort?: string;
};

export type AuthResponse = {
  id: string;
  token: string;
  email: string;
  name?: string;
  expiresAt: number;
};

export type PreferenceMatch = {
  program: BachelorProgramSummary;
  status: "CERTAIN" | "RISKY" | "DIFFICULT" | "UNKNOWN";
};

export type ScoreBreakdown = {
  scoreType: ScoreType;
  tytNet: number;
  aytNet: number;
  diplomaGrade: number | null;
  obp: number;
  hamPuan: number;
  obpKatkisi: number;
  toplamPuan: number;
};

export const bachelorApi = {
  list: async (filter: BachelorFilter): Promise<PagedResult<BachelorProgramSummary>> => {
    const { data } = await api.get("/bachelor", { params: filter });
    return data;
  },
  programNames: async (): Promise<string[]> => {
    const { data } = await api.get("/bachelor/program-names");
    return data;
  },
  detail: async (id: number): Promise<BachelorProgramDetail> => {
    const { data } = await api.get(`/bachelor/${id}`);
    return data;
  },
  wizard: async (params: { scoreType: string; rank: number; year?: number }): Promise<PreferenceMatch[]> => {
    const { data } = await api.get("/bachelor/wizard", { params });
    return data;
  },
};

export const universityApi = {
  list: async (filter: { city?: string } = {}): Promise<University[]> => {
    const { data } = await api.get("/university", { params: filter });
    return data;
  },
  detail: async (id: number): Promise<University> => {
    const { data } = await api.get(`/university/${id}`);
    return data;
  },
  map: async (id: number): Promise<UniversityMapData> => {
    const { data } = await api.get(`/university/${id}/map`);
    return data;
  },
  cities: async (): Promise<string[]> => {
    const { data } = await api.get("/university/cities");
    return data;
  },
};

export const scoreApi = {
  calculate: async (params: {
    tytNet: number;
    aytNet: number;
    scoreType: string;
    diplomaGrade?: number;
  }): Promise<ScoreBreakdown> => {
    const { data } = await api.get("/bachelor/calculate-score", { params });
    return data;
  },
};

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/register", { email, password, name });
    return data;
  },
  logout: () => localStorage.removeItem("token"),
};

export const preferenceApi = {
  getLists: async () => {
    const { data } = await api.get("/preference/lists");
    return data;
  },
  createList: async (name: string) => {
    const { data } = await api.post("/preference/lists", { name });
    return data;
  },
  addItem: async (listId: string, programId: number) => {
    const { data } = await api.post(`/preference/lists/${listId}/items`, { programId });
    return data;
  },
  removeItem: async (listId: string, itemId: string) => {
    await api.delete(`/preference/lists/${listId}/items/${itemId}`);
  },
};

export default api;
