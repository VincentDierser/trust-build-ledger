import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Logo } from './Logo';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-sm font-medium text-muted-foreground">
              Build with Trust, Secure Every Record.
            </div>
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
        <div className="md:hidden text-xs text-muted-foreground mt-2 text-center">
          Build with Trust, Secure Every Record.
        </div>
      </div>
    </header>
  );
};
