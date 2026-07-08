import { render } from '@testing-library/react-native';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';

// T005 — renders a real RN component tree and asserts wizard progress copy.
describe('WizardHeader', () => {
  it('shows the current step position', () => {
    const { getByText } = render(<WizardHeader current="consent" />);
    expect(getByText('Paso 2 de 5')).toBeTruthy();
  });

  it('renders the VITA wordmark', () => {
    const { getByText } = render(<WizardHeader current="welcome" />);
    expect(getByText('VITA')).toBeTruthy();
  });
});
