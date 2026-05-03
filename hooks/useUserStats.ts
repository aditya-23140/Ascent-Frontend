import { useUserContext } from "@/components/UserProvider";

/**
 * Hook for consuming the shared user profile and stats context.
 * Now all components share the same state.
 */
export function useUserStats() {
  const context = useUserContext();
  
  return {
    stats: context.stats,
    profile: context.profile,
    loading: context.loading,
    error: context.error,
    fetchUserData: context.fetchUserData,
    refreshStats: context.refreshStats,
    updateUserProfile: context.updateUserProfile,
  };
}

// Export interfaces from UserProvider for convenience if needed elsewhere
export type { IUserStats, IUserProfile } from "@/components/UserProvider";
