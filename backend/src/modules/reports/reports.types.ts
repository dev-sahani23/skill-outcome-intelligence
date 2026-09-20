export type TraineeReportDTO = {
  reportType: "trainee";
  generatedAt: string;
  trainee: {
    name: string;
    district: string | null;
    gender: string | null;
  };
  training: {
    courseName: string;
    providerName: string;
    completedDate: string | null;
    certified: boolean;
  }[];
  outcome: {
    currentStatus: "employed" | "self_employed" | "unemployed" | "unknown";
    employerName: string | null;
    jobRole: string | null;
    trainingRelevance: string | null;
  } | null;
  wageProgression: {
    initialWage: number | null;
    currentWage: number | null;
    changePercent: number | null;
    recordCount: number;
  } | null;
  nonPlacementReason: {
    reasonCode: string | null;
    reasonSource: string | null;
    detail: string | null;
  } | null;
  followUpHistory: {
    stage: string;
    status: string;
    respondedAt: string | null;
  }[];
};

export type CourseReportDTO = {
  reportType: "course" | "provider";
  generatedAt: string;
  subject: {
    name: string;
    sector: string | null;
    district: string | null;
  };
  enrollment: {
    total: number;
    completed: number;
    dropped: number;
    completionRate: number | null;
  };
  placement: {
    placed: number;
    notPlaced: number;
    placementRate: number | null;
    avgInitialWage: number | null;
  };
  retention: {
    retainedAt6Months: number;
    retentionRate: number | null;
  };
  nonPlacementReasons: {
    reasonCode: string;
    count: number;
    percent: number | null;
  }[];
  courseRating: number | null;
  recommendation: string;
};

export type SystemReportDTO = {
  reportType: "system";
  generatedAt: string;
  overview: {
    totalTrainees: number;
    totalEnrollments: number;
    totalPlaced: number;
    overallPlacementRate: number | null;
    avgWageAcrossSystem: number | null;
    avgSkillGapScore: number | null;
  };
  byDistrict: {
    districtName: string;
    traineeCount: number;
    placementRate: number | null;
    avgWage: number | null;
    performance: "strong" | "average" | "underperforming" | "n/a";
  }[];
  bySector: {
    sector: string;
    traineeCount: number;
    placementRate: number | null;
    topSkillGap: string | null;
  }[];
  underperformingDistricts: string[];
  underperformingSectors: string[];
};

export type EmptyReportDTO = {
  enrollmentTotal: number;
  completionRate: null;
  placementRate: null;
  message: string;
};
