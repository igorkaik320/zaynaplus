import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { AtSign, Lock } from 'lucide-react';
import { ZaynaLogo } from '@/components/ZaynaLogo';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      if (!displayName.trim()) { toast.error('Informe seu nome'); setLoading(false); return; }
      const { error } = await signUp(email, password, displayName.trim());
      if (error) toast.error(error.message);
      else toast.success('Conta criada com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8">
        <div className="text-center text-xs uppercase tracking-[0.5em] text-teal-700/70">Plataforma Clínica Zayna</div>
        <Card className="w-full max-w-md rounded-[28px] border border-teal-100 bg-white shadow-[0_25px_60px_rgba(20,184,166,0.18)]">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center gap-2">
              <ZaynaLogo className="flex items-center justify-center" imgClassName="h-14 w-auto" />
              <p className="text-muted-foreground text-sm">{isLogin ? 'Entre na sua conta' : 'Crie sua conta'}</p>
              <p className="text-xs text-slate-500">Sistema de gestão da clínica</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label>Nome completo</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu nome" required={!isLogin} />
                </div>
              )}
              <div className="relative">
                <Label>Email</Label>
                <AtSign className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Label>Senha</Label>
                <Lock className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="pl-10"
                />
                <p className="mt-1 text-right text-[11px] text-slate-500">Use letras maiúsculas e números para mais segurança</p>
              </div>
              <Button
                type="submit"
                className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-[0_15px_30px_rgba(20,184,166,0.35)] transition hover:-translate-y-0.5 hover:bg-teal-600"
                disabled={loading}
              >
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
              </Button>
              <Button variant="link" className="w-full text-sm text-slate-500" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs uppercase tracking-[0.45em] text-teal-700/40">2026 • Clínica Zayna</p>
      </div>
    </div>
  );
}
