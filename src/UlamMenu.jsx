import { useState } from 'react'
import {
  Star, Settings, Search, X, Plus, Trash2,
  AlertTriangle, Info, CheckCircle, Copy,
} from 'lucide-react'
import LinkSkipTo from './components/ui/SkipLink.jsx'
import Button from './components/ui/Button.jsx'
import ButtonLink from './components/ui/ButtonLink.jsx'
import ButtonIcon from './components/ui/ButtonIcon.jsx'
import Badge from './components/ui/Badge.jsx'
import RadioChip from './components/ui/RadioChip.jsx'
import Toggle from './components/ui/Toggle.jsx'
import Select from './components/ui/Select.jsx'
import InputWithClear from './components/ui/InputWithClear.jsx'
import Panel from './components/ui/PanelReact.jsx'
import InputSearch from './components/ui/InputSearch.jsx'
import { BottomSheet, Modal, Drawer } from './siling-labuyo/index.js'
import { usePref } from './calamansi/react.js'
import { setLocale, getT } from './calamansi/index.js'
import './UlamMenu.css'

function Section({ title, children }) {
  return (
    <section className="ulam-section">
      <h2 className="ulam-section-title">{title}</h2>
      <div className="ulam-section-body">{children}</div>
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="ulam-row">
      <span className="ulam-row-label">{label}</span>
      <div className="ulam-row-content">{children}</div>
    </div>
  )
}

export default function UlamMenu() {
  const [radioVal, setRadioVal] = useState('b')
  const [chipVal, setChipVal] = useState('aa')
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const [toggle3, setToggle3] = useState(false)
  const [selectVal, setSelectVal] = useState('react')
  const [inputVal, setInputVal] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [liveSearch, setLiveSearch] = usePref('ulam-menu-live-search', true)
  const [textVal, setTextVal] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [btnActive, setBtnActive] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="ulam-menu">
      <header className="ulam-menu-header">
        <div className="ulam-menu-header-brand">
          <span className="ulam-menu-wordmark">ulam</span>
          <span className="ulam-menu-tagline">the menu</span>
        </div>
        <p className="ulam-menu-desc">Component gallery for the ulam framework — @ulam/ube, @ulam/calamansi, @ulam/adobo, @ulam/sawsawan.</p>
      </header>

      <main className="ulam-menu-main">

        <Section title="Typography — Headings">
          <h1>Heading level 1</h1>
          <h2>Heading level 2</h2>
          <h3>Heading level 3</h3>
          <h4>Heading level 4</h4>
          <h5>Heading level 5</h5>
          <h6>Heading level 6</h6>
        </Section>

        <Section title="Typography — Body">
          <Row label="Paragraph">
            <p>This is a standard paragraph. It demonstrates the default body text size, line height, and color as defined by the CSS tokens.</p>
          </Row>
          <Row label="Strong / emphasis">
            <p><strong>Strong text</strong> and <em>emphasized text</em> inline.</p>
          </Row>
          <Row label="Small">
            <p><small>Small helper text for captions or supplemental info.</small></p>
          </Row>
        </Section>

        <Section title="Button">
          <Row label="Primary">
            <Button variant="primary" onClick={() => {}}>Save changes</Button>
            <Button variant="primary" icon={<Star size={16} />} onClick={() => {}}>With icon</Button>
            <Button variant="primary" disabled onClick={() => {}}>Disabled</Button>
          </Row>
          <Row label="Secondary">
            <Button variant="secondary" onClick={() => {}}>Cancel</Button>
            <Button variant="secondary" icon={<Settings size={16} />} onClick={() => {}}>With icon</Button>
            <Button variant="secondary" disabled onClick={() => {}}>Disabled</Button>
          </Row>
          <Row label="Danger">
            <Button variant="danger" onClick={() => {}}>Delete</Button>
            <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => {}}>With icon</Button>
          </Row>
          <Row label="Toggle state">
            <Button
              variant="secondary"
              active={btnActive}
              icon={<Star size={16} />}
              label="Star"
              activeLabel="Starred"
              onClick={() => setBtnActive(v => !v)}
            >
              {btnActive ? 'Starred' : 'Star'}
            </Button>
          </Row>
          <Row label="Save cycle">
            <Button
              variant="primary"
              icon={<Copy size={16} />}
              active={saved}
              label="Save"
              activeLabel="Saved"
              onClick={handleSave}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </Row>
          <Row label="Full width">
            <Button variant="primary" fullWidth onClick={() => {}}>Full-width button</Button>
          </Row>
        </Section>

        <Section title="ButtonIcon">
          <Row label="Accent">
            <ButtonIcon icon={<X size={20} />} label="Close" variant="accent" onClick={() => {}} />
            <ButtonIcon icon={<Settings size={20} />} label="Settings" variant="accent" onClick={() => {}} />
            <ButtonIcon icon={<Search size={20} />} label="Search" variant="accent" onClick={() => {}} />
          </Row>
          <Row label="Tertiary">
            <ButtonIcon icon={<Plus size={20} />} label="Add" variant="tertiary" onClick={() => {}} />
            <ButtonIcon icon={<AlertTriangle size={20} />} label="Warning" variant="tertiary" onClick={() => {}} />
          </Row>
          <Row label="Disabled">
            <ButtonIcon icon={<Star size={20} />} label="Star" variant="accent" disabled onClick={() => {}} />
          </Row>
        </Section>

        <Section title="ButtonLink">
          <Row label="Primary">
            <ButtonLink href="https://a11yhelper.app" variant="primary">a11yhelper.app</ButtonLink>
          </Row>
          <Row label="Secondary">
            <ButtonLink href="https://a11yhelper.app" variant="secondary">Secondary link</ButtonLink>
          </Row>
        </Section>

        <Section title="Badge">
          <Row label="Severity">
            <Badge variant="critical">Critical</Badge>
            <Badge variant="high">High</Badge>
            <Badge variant="medium">Medium</Badge>
            <Badge variant="best-practice">Best Practice</Badge>
          </Row>
          <Row label="Status">
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </Row>
          <Row label="Neutral">
            <Badge variant="neutral">Neutral</Badge>
          </Row>
          <Row label="With prefix">
            <Badge variant="critical" prefix="SC">2.4.3</Badge>
            <Badge variant="high" prefix="ACC">ACC-001</Badge>
          </Row>
          <Row label="Clickable">
            <Badge variant="high" onClick={() => {}}>Clickable badge</Badge>
          </Row>
        </Section>

        <Section title="RadioChip">
          <Row label="WCAG level">
            <div className="ulam-chip-group">
              {[
                { value: 'a', label: 'A' },
                { value: 'aa', label: 'AA' },
                { value: 'aaa', label: 'AAA' },
              ].map(opt => (
                <RadioChip
                  key={opt.value}
                  name="wcag-level"
                  value={opt.value}
                  label={opt.label}
                  current={chipVal}
                  onChange={setChipVal}
                />
              ))}
            </div>
          </Row>
          <Row label="Platform">
            <div className="ulam-chip-group">
              {[
                { value: 'web', label: 'Web' },
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' },
                { value: 'all', label: 'All' },
              ].map(opt => (
                <RadioChip
                  key={opt.value}
                  name="platform"
                  value={opt.value}
                  label={opt.label}
                  current={radioVal}
                  onChange={setRadioVal}
                />
              ))}
            </div>
          </Row>
        </Section>

        <Section title="Toggle">
          <Row label="Off">
            <label htmlFor="tog1" className="ulam-toggle-label">
              <Toggle id="tog1" checked={toggle1} onChange={setToggle1} />
              Enable notifications
            </label>
          </Row>
          <Row label="On">
            <label htmlFor="tog2" className="ulam-toggle-label">
              <Toggle id="tog2" checked={toggle2} onChange={setToggle2} />
              Live search
            </label>
          </Row>
          <Row label="Disabled">
            <label htmlFor="tog3" className="ulam-toggle-label ulam-toggle-label--disabled">
              <Toggle id="tog3" checked={toggle3} onChange={setToggle3} disabled />
              Locked setting
            </label>
          </Row>
        </Section>

        <Section title="Select">
          <Row label="Default">
            <Select
              id="framework"
              value={selectVal}
              onChange={e => setSelectVal(e.target.value)}
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
              <option value="angular">Angular</option>
            </Select>
          </Row>
          <Row label="Disabled">
            <Select id="disabled-select" value="react" onChange={() => {}} disabled>
              <option value="react">React</option>
            </Select>
          </Row>
        </Section>

        <Section title="InputSearch">
          <Row label="Live search">
            <InputSearch
              id="search-live"
              value={searchVal}
              onChange={setSearchVal}
              liveSearch={true}
              placeholder="Search (live)…"
              label="Live search example"
              clearAriaLabel="Clear search"
            />
          </Row>
          <Row label="Submit mode">
            <InputSearch
              id="search-submit"
              value={searchVal}
              onChange={setSearchVal}
              onSubmit={() => {}}
              liveSearch={false}
              placeholder="Search (submit)…"
              label="Submit search example"
              clearAriaLabel="Clear search"
              submitAriaLabel="Search"
            />
          </Row>
          <Row label="Live search toggle">
            <label htmlFor="live-tog" className="ulam-toggle-label">
              <Toggle id="live-tog" checked={liveSearch} onChange={setLiveSearch} />
              Live search {liveSearch ? 'on' : 'off'}
            </label>
          </Row>
          <Row label="With toggle">
            <InputSearch
              id="search-toggled"
              value={searchVal}
              onChange={setSearchVal}
              onSubmit={() => {}}
              liveSearch={liveSearch}
              placeholder="Search…"
              label="Toggled search example"
              clearAriaLabel="Clear search"
              submitAriaLabel="Search"
            />
          </Row>
          <Row label="Disabled">
            <InputSearch
              id="search-disabled"
              value=""
              onChange={() => {}}
              liveSearch={false}
              placeholder="Disabled…"
              label="Disabled search example"
              disabled
              clearAriaLabel="Clear"
              submitAriaLabel="Search"
            />
          </Row>
        </Section>

        <Section title="InputWithClear">
          <Row label="Default">
            <InputWithClear
              id="search-demo"
              type="search"
              value={inputVal}
              onChange={setInputVal}
              placeholder="Search…"
              clearAriaLabel="Clear search"
              wrapClassName="ulam-input-wrap"
              inputClassName="ulam-input"
              clearButtonClassName="ulam-input-clear"
            />
          </Row>
          <Row label="Disabled">
            <input
              type="text"
              className="ulam-input"
              value="Disabled value"
              disabled
              aria-label="Disabled input"
              onChange={() => {}}
            />
          </Row>
        </Section>

        <Section title="Textarea">
          <Row label="Default">
            <textarea
              className="ulam-textarea"
              rows={4}
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              placeholder="Enter notes here…"
              aria-label="Textarea example"
            />
          </Row>
        </Section>

        <Section title="Overlays">
          <Row label="Bottom Sheet">
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>Open Bottom Sheet</Button>
            <BottomSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              label="Example Bottom Sheet"
              closeLabel="Close"
            >
              <div className="ulam-overlay-content">
                <h3>Bottom Sheet</h3>
                <p>Slides up from the bottom. Escape or swipe down dismisses. Focus is trapped while open (WCAG 2.1.2) and returns to the trigger on close.</p>
              </div>
            </BottomSheet>
          </Row>
          <Row label="Modal">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              heading="Example Modal"
            >
              <p>Centered dialog with focus trap and Escape-to-dismiss. Focus is restored to the trigger on close.</p>
              <div className="ulam-modal-actions">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
              </div>
            </Modal>
          </Row>
          <Row label="Drawer">
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              label="Example Drawer"
            >
              <div className="ulam-overlay-content">
                <h3>Drawer</h3>
                <p>Slides in from the left. Focus is trapped while open, restored to trigger on close.</p>
                <Button variant="primary" onClick={() => setDrawerOpen(false)}>Close Drawer</Button>
              </div>
            </Drawer>
          </Row>
          <Row label="Panel">
            <Button variant="secondary" onClick={() => setPanelOpen(true)}>Open Panel</Button>
            {panelOpen && (
              <div className="ulam-panel-shell">
                <Panel
                  heading="Example Panel"
                  onClose={() => setPanelOpen(false)}
                  closeAriaLabel="Close panel"
                >
                  <div className="ulam-overlay-content">
                    <p>Panel with back-button header. Focuses the heading on mount and restores the page title on unmount.</p>
                    <Button variant="secondary" onClick={() => setPanelOpen(false)}>Go back</Button>
                  </div>
                </Panel>
              </div>
            )}
          </Row>
        </Section>

        <Section title="SkipLink">
          <Row label="Anchor (href)">
            <p id="ulam-skip-target" tabIndex={-1} style={{ outline: 'none' }}>← focus lands here</p>
            <LinkSkipTo href="#ulam-skip-target">Skip to target</LinkSkipTo>
          </Row>
          <Row label="Button (onClick)">
            <LinkSkipTo onClick={() => alert('skip action fired')}>Skip (button)</LinkSkipTo>
          </Row>
          <Row label="No icon">
            <LinkSkipTo href="#ulam-skip-target" showIcon={false}>Skip (no icon)</LinkSkipTo>
          </Row>
        </Section>

        <Section title="calamansi — vanilla API">
          <Row label="setLocale / getT">
            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
              <code>setLocale('tl')</code> switches the module singleton. <code>getT()</code> returns the current translate function synchronously — no React required.
            </p>
            <Button variant="secondary" onClick={() => { setLocale('tl'); alert(getT()('common.skip_to_main')) }}>
              getT() in Tagalog
            </Button>
            <Button variant="secondary" onClick={() => { setLocale('en'); alert(getT()('common.skip_to_main')) }}>
              getT() in English
            </Button>
          </Row>
          <Row label="usePref (React hook)">
            <label htmlFor="live-pref-tog" className="ulam-toggle-label">
              <Toggle id="live-pref-tog" checked={liveSearch} onChange={setLiveSearch} />
              Live search persisted: {String(liveSearch)}
            </label>
            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
              Backed by <code>getPref</code> / <code>setPref</code> in localStorage. Reload the page — the value persists.
            </p>
          </Row>
        </Section>

        <Section title="Status indicators">
          <Row label="Info">
            <div className="ulam-status ulam-status--info">
              <Info size={18} aria-hidden="true" />
              <span>Informational message</span>
            </div>
          </Row>
          <Row label="Success">
            <div className="ulam-status ulam-status--success">
              <CheckCircle size={18} aria-hidden="true" />
              <span>Action completed successfully</span>
            </div>
          </Row>
          <Row label="Warning">
            <div className="ulam-status ulam-status--warning">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>Warning — review before proceeding</span>
            </div>
          </Row>
        </Section>

      </main>
    </div>
  )
}
