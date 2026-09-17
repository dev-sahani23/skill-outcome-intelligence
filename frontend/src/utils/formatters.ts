export const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

export const formatFollowUpStage = (stage: string): string => {
  const map: Record<string, string> = {
    AT_CERTIFICATION: 'At Certification',
    DAY_30: '30 Days',
    MONTH_3: '3 Months',
    MONTH_6: '6 Months',
    MONTH_12: '12 Months',
    MONTH_24: '24 Months',
  };
  return map[stage] || stage;
};
