import { ClipboardPaste, Hand } from 'lucide-react'

export default function AppTitle({ t }) {
  return <>{t('app.name')}<span className="page-title__icons" aria-hidden="true"><Hand size={28} /><ClipboardPaste size={28} /></span></>
}
