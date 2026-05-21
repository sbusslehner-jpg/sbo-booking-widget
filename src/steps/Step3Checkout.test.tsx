import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Step3Checkout } from './Step3Checkout'
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
          hasPrefilledCustomer: false,
          consent: { functional: true, analytics: false, marketing: false },
        }}
      >
        <Step3Checkout onBack={() => {}} onSubmit={() => {}} submitting={false} />
      </WidgetProvider>
    </I18nextProvider>,
  )
}

describe('Step3Checkout', () => {
  beforeEach(() => {
    useBookingStore.getState().reset()
  })

  it('renders title and submit button', async () => {
    renderStep()
    expect(await screen.findByText('Fast geschafft!')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Termin verbindlich buchen/i }),
      ).toBeInTheDocument()
    })
  })

  it('keeps submit button disabled while form is invalid', async () => {
    renderStep()
    const submit = await screen.findByRole('button', { name: /Termin verbindlich buchen/i })
    expect(submit).toBeDisabled()
  })
})
