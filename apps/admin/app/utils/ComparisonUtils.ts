// In: apps/admin/app/utils/ComparisonUtils.ts

export const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

export const getComparisonData = (data: any) => {
    if (!data?.last12Months || data.last12Months.length < 2) return null;
    const lastTwo = data.last12Months.slice(-2);
    const current = lastTwo[1].count;
    const previous = lastTwo[0].count;
    return { current, percent: calculatePercentChange(current, previous) };
};