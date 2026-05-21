import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Step2Service } from './Step2Service'
import { WidgetProvider } from '../widget/WidgetContext'
import { MockBookingService } from '../data/service'
import { useBookingStore } from '../state/store'
import { initI18n } from '../i18n'
import { I18nextProvider } from 'react-i18next'

function renderStep() {
  const i18n = initI18n('de')
  return render(
    <I18nextProvider i18n={i18n}>
      <WidgetProvider
        value={{
          service: new MockBookingService(),
          dealerId: 'test',
          isOverlay: false,
          isMobile: false,
          onClose: () => {},
        }}
      >
        <Step2Service onNext={() => {}} onBack={() => {}} />
      </WidgetProvider>
    </I18nextProvider>,
  )
}

describe('Step2Service', () => {
  beforeEach(() => {
    useBookingStore.getState().reset()
  })

  it('renders hero and main services', async () => {
    renderStep()
    expect(await screen.findByText(/Wählen Sie ihren Service/i)).toBeInTheDocument()
    expect(await screen.findByText(/Personalisierter Service-Check/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/Pickerl §57a/)).toBeInTheDocument()
    })
  })

  it('enables next button once a service is selected', async () => {
    renderStep()
    const next = await screen.findByRole('button', { name: /Weiter zum Abschluss/i })
    expect(next).toBeDisabled()
    const card = await screen.findByText('Räderwechsel')
    fireEvent.click(card)
    expect(next).not.toBeDisabled()
  })
})
