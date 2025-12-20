import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'card' | 'hero';
}

export default function PageHeader({ title, subtitle, action, variant = 'card' }: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-green-600 via-green-500 to-emerald-500">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" />
        <div className="p-6 lg:p-8 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-1 text-white">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white border">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
        </div>
        {action && <div data-slot="card-action">{action}</div>}
      </CardHeader>
      <CardContent />
    </Card>
  );
}
