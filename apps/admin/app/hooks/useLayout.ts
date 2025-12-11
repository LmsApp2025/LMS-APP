import { useEffect, useState, useMemo } from 'react';
import { useGetHeroDataQuery, useEditLayoutMutation } from '@/redux/features/layout/layoutApi';
import { toast } from 'react-hot-toast';

export function useLayout(layoutType: 'Banner' | 'FAQ' | 'Categories') {
  const { data, isLoading, refetch } = useGetHeroDataQuery(layoutType, {
    refetchOnMountOrArgChange: true,
  });
  const [editLayout, { isSuccess, error }] = useEditLayoutMutation();

  const [originalState, setOriginalState] = useState<any | null>(null);
  const [currentState, setCurrentState] = useState<any | null>(null);

  useEffect(() => {
    if (data?.layout) {
      const relevantData = data.layout[layoutType.toLowerCase()];
      setOriginalState(relevantData);
      setCurrentState(relevantData);
    }
  }, [data, layoutType]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(`${layoutType} updated successfully`);
      refetch(); 
    }
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        toast.error((error as any).data.message);
      }
    }
  }, [isSuccess, error, refetch, layoutType]);

  const isUnchanged = useMemo(() => {
    return JSON.stringify(originalState) === JSON.stringify(currentState);
  }, [originalState, currentState]);

  const handleSave = async () => {
    if (!isUnchanged) {
      const payload = {
        type: layoutType,
        [layoutType.toLowerCase()]: currentState,
      };
      await editLayout(payload);
    }
  };

  return {
    isLoading,
    originalState,
    currentState,
    setCurrentState,
    isUnchanged,
    handleSave,
  };
}