import { House } from 'lucide-react'
import { useT } from '@ulam/calamansi/react'
import { useRouter } from '@ulam/sili/react'

export default function A11yNotFoundPage() {
  const t = useT()
  const { navigate } = useRouter()
  return (
    <div className="not-found">
      <h2 className="not-found__heading">{t('notfound.heading')}</h2>
      <p className="not-found__body">{t('notfound.body')}</p>
      <button
        onClick={() => navigate('/')}
        className="btn btn--primary"
      >
        <House size="1em" aria-hidden="true" />
        {t('notfound.button')}
      </button>
    </div>
  )
}
