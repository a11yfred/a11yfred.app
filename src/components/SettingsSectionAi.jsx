import { PanelRowSetting, Toggle, Select } from '@ulam/ube'
import { useT } from '@ulam/calamansi/react'



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
          {pendingAiEnabled && <span className="panel-field-required"> {t('settings.api_key_required')}</span>}
        </label>
        <Select
          id="active-provider"
          value={activeProvider}
          onChange={e => {
            setActiveProvider(e.target.value)
            if (errors.provider) setErrors({})
          }}
          aria-disabled={!pendingAiEnabled ? 'true' : undefined}
          aria-invalid={errors.provider && pendingAiEnabled ? 'true' : undefined}
          aria-describedby={errors.provider && pendingAiEnabled ? 'provider-error' : undefined}
        >
          <option value="">Select one</option>
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </Select>
        {errors.provider && pendingAiEnabled && (
          <p id="provider-error" className="panel-field-error">
            {t('settings.provider_error')}
          </p>
        )}
      </div>

      <div className="settings-provider-group">
        <label htmlFor="active-model" className="panel-field-label">
          {t('settings.model_label')}
        </label>
        <Select
          id="active-model"
          value={activeProvider && PROVIDER_MODELS[activeProvider]?.length > 0 ? models[activeProvider] : 'N/A'}
          onChange={e => activeProvider && setModels(prev => ({ ...prev, [activeProvider]: e.target.value }))}
          aria-disabled={(!pendingAiEnabled || !activeProvider || !PROVIDER_MODELS[activeProvider]?.length) ? 'true' : undefined}
        >
          {!activeProvider ? (
            <option value="">Select Active Provider</option>
          ) : !PROVIDER_MODELS[activeProvider]?.length ? (
            <option value="N/A" disabled>N/A</option>
          ) : (
            activeProvider && PROVIDER_MODELS[activeProvider]?.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))
          )}
        </Select>
      </div>

      <div className="settings-key-group">
        <label htmlFor="apikey-input" className="panel-field-label">
          {t('settings.api_key_label_prefix')}{activeProvider && `, ${PROVIDERS.find(p => p.id === activeProvider)?.label}`}
          {pendingAiEnabled && <span className="panel-field-required"> {t('settings.api_key_required')}</span>}
        </label>
        <textarea
          id="apikey-input"
          autoComplete="off"
          value={activeProvider ? keys[activeProvider] : ''}
          onChange={e => {
            if (!pendingAiEnabled || !activeProvider) return
            setKeys(prev => ({ ...prev, [activeProvider]: e.target.value }))
            if (errors.apiKey) setErrors({})
          }}
          placeholder={activeProvider ? (PROVIDERS.find(p => p.id === activeProvider)?.placeholderKey && t(PROVIDERS.find(p => p.id === activeProvider).placeholderKey)) : t('settings.api_placeholder_default')}
          className="settings-key-input"
          aria-disabled={!pendingAiEnabled || !activeProvider ? 'true' : undefined}
          aria-invalid={errors.apiKey && pendingAiEnabled && activeProvider ? 'true' : undefined}
          aria-describedby={errors.apiKey && pendingAiEnabled && activeProvider ? 'api-key-error' : undefined}
        />
        {errors.apiKey && pendingAiEnabled && activeProvider && (
          <p id="api-key-error" className="panel-field-error">
            {t('settings.api_key_error')}
          </p>
        )}
      </div>

      <PanelRowSetting
        sm
        label={<label htmlFor="toggle-agentic">{t('settings.agentic_mode_label')}</label>}
        description={t('settings.agentic_mode_desc')}
      >
        {pendingAgenticMode !== (isAgenticModeEnabled()) && <PendingNote t={t} />}
        <Toggle id="toggle-agentic" checked={pendingAgenticMode} onChange={() => setPendingAgenticMode(v => !v)} disabled={!pendingAiEnabled || activeProvider !== 'anthropic'} />
      </PanelRowSetting>
    </section>
  )
}
