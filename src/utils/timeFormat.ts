
export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} Min.`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours} Std.`;
  }
  
  return `${hours} Std. ${remainingMinutes} Min.`;
};
