import {
  forgotPasswordPanelConfig,
  sidePanelConfig,
  signUpPanelConfig,
} from './auth-page.data';
import { AuthSidePanelConfig } from '../models/auth.models';

describe('auth-page.data', () => {
  const allConfigs: Array<[string, AuthSidePanelConfig]> = [
    ['sidePanelConfig', sidePanelConfig],
    ['signUpPanelConfig', signUpPanelConfig],
    ['forgotPasswordPanelConfig', forgotPasswordPanelConfig],
  ];

  it('defines the sign-in side panel config', () => {
    expect(sidePanelConfig.image).toBe('/assets/images/sign-in.png');
    expect(sidePanelConfig.title).toBe('Smart Banking, Smarter Decisions.');
    expect(sidePanelConfig.description).toBe(
      'Take control of your finances with CashFlow.',
    );
    expect(sidePanelConfig.showCashFlowStats).toBeTrue();
    expect(sidePanelConfig.showSecurityPoints).toBeTrue();
  });

  it('defines the sign-up side panel config', () => {
    expect(signUpPanelConfig.image).toBe('/assets/images/sign-up.png');
    expect(signUpPanelConfig.title).toBe('Build Your Financial Future.');
    expect(signUpPanelConfig.showCashFlowStats).toBeTrue();
    expect(signUpPanelConfig.showSecurityPoints).toBeTrue();
  });

  it('defines the forgot-password side panel config', () => {
    expect(forgotPasswordPanelConfig.image).toBe(
      '/assets/images/forgot-password.png',
    );
    expect(forgotPasswordPanelConfig.title).toBe('Get Back to Your Finances.');
    expect(forgotPasswordPanelConfig.description).toContain('Reset it securely');
  });

  allConfigs.forEach(([name, config]) => {
    describe(name, () => {
      it('provides a non-empty image, title and description', () => {
        expect(config.image.length).toBeGreaterThan(0);
        expect(config.title.length).toBeGreaterThan(0);
        expect(config.description.length).toBeGreaterThan(0);
      });

      it('references an image inside the assets/images folder', () => {
        expect(config.image).toMatch(/^\/assets\/images\/.+\.png$/);
      });
    });
  });
});
