export function useProjectConfig() {
  type ProjectAppConfig = {
    project: {
      storeName: string
      storeInitial?: string
    }
  }

  const appConfig = useAppConfig() as unknown as ProjectAppConfig
  const storeName = computed(() => appConfig.project.storeName)
  const storeInitial = computed(() => appConfig.project.storeInitial || storeName.value.charAt(0))

  return {
    storeName,
    storeInitial,
  }
}
