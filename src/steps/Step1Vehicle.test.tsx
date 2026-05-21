import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Step1Vehicle } from './Step1Vehicle'
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
        }}
      >
        <Step1Vehicle onNext={() => {}} />
      </WidgetProvider>
    </I18nextProvider>,
  )
}

describe('Step1Vehicle', () => {
  beforeEach(() => {
    useBookingStore.getState().reset()
  })

  it('renders title and brand grid', async () => {
    renderStep()
    expect(await screen.findByText(/Mit welchem Fahrzeug/i)).toBeInTheDocument()
    expect(await screen.findByLabelText('Audi')).toBeInTheDocument()
  })

  it('disables next button until brand+model selected', async () => {
    renderStep()
    const nextBtn = await screen.findByRole('button', { name: /Weiter zum Abschluss/i })
    expect(nextBtn).toBeDisabled()
    fireEvent.click(await screen.findByLabelText('Volkswagen'))
    await waitFor(() => {
      expect(screen.queryByText('Polo')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Polo'))
    expect(nextBtn).not.toBeDisabled()
  })
})
