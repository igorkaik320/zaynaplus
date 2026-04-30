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
        <Card className="w-full max-w-md rounded-[28px] border border-teal-100 bg-white shadow-[0_25px_60px_rgba(20,184,166,0.18)]">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center gap-4">
              <ZaynaLogo className="flex items-center justify-center" imgClassName="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
                </h1>
                <p className="text-slate-600 text-sm">
                  {isLogin ? 'Entre para acessar o sistema' : 'Cadastre-se para começar'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-slate-700">Nome completo</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome completo"
                    required={!isLogin}
                    className="border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="pl-10 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pl-10 h-11 border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
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
      </div>
    </div>
  );
}
