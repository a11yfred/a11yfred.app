export const getPlatformLabel = (platform, t) => {
  const labels = {
    all: t('settings.platform_all'),
    web: t('settings.platform_web'),
    native: t('settings.platform_native'),
    document: t('settings.platform_document'),
  }
  return labels[platform] ?? labels.all
}

export const getViewAllPlatformLabel = (platform, t) => {
  const labels = {
    web: t('search.view_all_platform_web'),
    native: t('search.view_all_platform_native'),
    document: t('search.view_all_platform_document'),
  }
  return labels[platform] ?? t('search.view_all_platform_all')
}
