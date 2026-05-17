import { useT } from '@ulam/calamansi/react'
import PanelRowSetting from './ui/PanelRowSetting.jsx'
import Toggle from './ui/Toggle.jsx'
import Select from './ui/Select.jsx'
import { PROVIDERS, PROVIDER_MODELS, isAgenticModeEnabled } from '@ulam/halohalo'

function PendingNote({ t }) {
  const raw = t('settings.pending_save_note')
  const [before, rest] = raw.split('{unsaved}')
  const [middle, after] = rest.split('{save}')
  return (
    <p className="panel-pending-note">
      {before}<strong>Unsaved.</strong>{middle}<strong>Save</strong>{after}
    </p>
  )
}

export default function SettingsSectionAi({
  aiEnabled,
  pendingAiEnabled,
  setPendingAiEnabled,
  activeProvider,
  setActiveProvider,
  models,
  setModels,
  keys,
  setKeys,
  errors,
  setErrors,
  pendingAgenticMode,
  setPendingAgenticMode,
}) {
  const t = useT()

  return (
    <section className="panel-section">
      <h3 className="panel-section-heading">{t('settings.ai_heading')}</h3>

      <PanelRowSetting
        sm
        label={<label htmlFor="toggle-ai">{t('settings.ai_enable_label')}</label>}
        description={<>Revises <strong>Descriptions</strong> and/or <strong>Suggested Fix</strong> based on your <strong>AI Instructions</strong>.</>}
      >
        {pendingAiEnabled !== aiEnabled && <PendingNote t={t} />}
        <Toggle id="toggle-ai" checked={pendingAiEnabled} onChange={() => setPendingAiEnabled(v => !v)} />
      </PanelRowSetting>

      <div className="settings-provider-group">
        <label htmlFor="active-provider" className="panel-field-label">
          {t('settings.provider_label')}
        </label>
        <Select
          id="active-provider"
          value={activeProvider}
          onChange={e => setActiveProvider(e.target.value)}
          disabled={!pendingAiEnabled}
        >
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </Select>
      </div>

      {PROVIDER_MODELS[activeProvider].length > 0 && (
        <div className="settings-provider-group">
          <label htmlFor="active-model" className="panel-field-label">
            {t('settings.model_label')}
          </label>
          <Select
            id="active-model"
            value={models[activeProvider]}
            onChange={e => setModels(prev => ({ ...prev, [activeProvider]: e.target.value }))}
            disabled={!pendingAiEnabled || !activeProvider}
          >
            {PROVIDER_MODELS[activeProvider].map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </Select>
        </div>
      )}

      {PROVIDERS.filter(p => p.id === activeProvider).map(p => (
        <div key={p.id} className="settings-key-group">
          <label htmlFor={`apikey-${p.id}`} className="panel-field-label">
            {t('settings.api_key_label_prefix')}, {p.label}
            {pendingAiEnabled && <span className="panel-field-required"> {t('settings.api_key_required')}</span>}
          </label>
          <textarea
            id={`apikey-${p.id}`}
            autoComplete="off"
            value={keys[p.id]}
            onChange={e => {
              if (!pendingAiEnabled) return
              setKeys(prev => ({ ...prev, [p.id]: e.target.value }))
              if (errors.apiKey) setErrors({})
            }}
            placeholder={t(p.placeholderKey)}
            className={`settings-key-input${!pendingAiEnabled ? ' settings-key-input--disabled' : ''}`}
            aria-invalid={errors.apiKey && pendingAiEnabled ? 'true' : undefined}
            aria-describedby={errors.apiKey && pendingAiEnabled ? 'api-key-error' : undefined}
          />
          {errors.apiKey && pendingAiEnabled && (
            <p id="api-key-error" className="panel-field-error">
              {t('settings.api_key_error')}
            </p>
          )}
        </div>
      ))}

      <PanelRowSetting
        sm
        disabled={!pendingAiEnabled || activeProvider !== 'anthropic'}
        label={<label htmlFor="toggle-agentic">{t('settings.agentic_mode_label')}</label>}
        description={t('settings.agentic_mode_desc')}
      >
        {pendingAgenticMode !== (isAgenticModeEnabled()) && <PendingNote t={t} />}
        <Toggle id="toggle-agentic" checked={pendingAgenticMode} onChange={() => setPendingAgenticMode(v => !v)} disabled={!pendingAiEnabled || activeProvider !== 'anthropic'} />
      </PanelRowSetting>
    </section>
  )
}
