'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/src/components/ui/input-otp';
import { CheckCircle2, Loader2, QrCode, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type TwoFactorSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otpUrl: string;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  onVerify: () => void;
  isVerifying: boolean;
};

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  otpUrl,
  verificationCode,
  onVerificationCodeChange,
  onVerify,
  isVerifying,
}: TwoFactorSetupDialogProps) {
  const t = useTranslations('Settings');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('security.twoFactor.setup.title')}</DialogTitle>
          <DialogDescription>{t('security.twoFactor.setup.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-full space-y-2">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <QrCode className="h-4 w-4" />
              {t('security.twoFactor.setup.step1')}
            </p>
            <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
              {otpUrl ? <QRCodeSVG value={otpUrl} size={180} /> : null}
            </div>
          </div>
          <div className="w-full space-y-2">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              {t('security.twoFactor.setup.step2')}
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={verificationCode} onChange={onVerificationCodeChange}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-11 w-10" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={onVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {isVerifying ? t('security.twoFactor.setup.verifying') : t('security.twoFactor.setup.verify')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
