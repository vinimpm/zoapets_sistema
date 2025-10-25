'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, TrendingUp, Building2, Gift } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type BillingInterval = 'monthly' | 'yearly';

interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

interface Plan {
  slug: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  popular?: boolean;
  features: PlanFeature[];
  cta: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  const plans: Plan[] = [
    {
      slug: 'free',
      name: 'Grátis',
      description: 'Para começar e testar o sistema',
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: <Gift className="h-6 w-6" />,
      cta: 'Começar Grátis',
      features: [
        { name: '1 usuário', included: true },
        { name: 'Até 50 pets cadastrados', included: true },
        { name: 'Até 20 consultas/mês', included: true },
        { name: 'Agendamentos', included: true },
        { name: 'Cadastro de pets e tutores', included: true },
        { name: 'Gestão de estoque', included: false },
        { name: 'Internações', included: false },
        { name: 'RAM (Monitoramento Anestésico)', included: false },
        { name: 'Exames laboratoriais', included: false },
        { name: 'Relatórios avançados', included: false },
        { name: 'WhatsApp integrado', included: false },
        { name: 'Suporte por email', included: true },
      ],
    },
    {
      slug: 'starter',
      name: 'Starter',
      description: 'Para clínicas pequenas crescendo',
      monthlyPrice: 199,
      yearlyPrice: 199 * 10, // 2 meses grátis
      icon: <TrendingUp className="h-6 w-6" />,
      cta: 'Começar Trial de 14 dias',
      features: [
        { name: '3 usuários', included: true },
        { name: 'Pets ilimitados', included: true },
        { name: 'Consultas ilimitadas', included: true },
        { name: 'Agendamentos', included: true },
        { name: 'Cadastro de pets e tutores', included: true },
        { name: 'Gestão de estoque', included: true },
        { name: 'Internações', included: false },
        { name: 'RAM (Monitoramento Anestésico)', included: false },
        { name: 'Exames laboratoriais', included: false },
        { name: 'Relatórios avançados', included: false },
        { name: 'WhatsApp integrado', included: false },
        { name: 'Suporte prioritário', included: true },
      ],
    },
    {
      slug: 'professional',
      name: 'Professional',
      description: 'Para clínicas completas',
      monthlyPrice: 299,
      yearlyPrice: 299 * 10, // 2 meses grátis
      icon: <Sparkles className="h-6 w-6" />,
      popular: true,
      cta: 'Começar Trial de 14 dias',
      features: [
        { name: '10 usuários', included: true },
        { name: 'Pets ilimitados', included: true },
        { name: 'Consultas ilimitadas', included: true },
        { name: 'Agendamentos', included: true },
        { name: 'Cadastro de pets e tutores', included: true },
        { name: 'Gestão de estoque', included: true },
        { name: 'Internações', included: true },
        { name: 'RAM (Monitoramento Anestésico)', included: true },
        { name: 'Exames laboratoriais', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'WhatsApp integrado', included: true },
        { name: 'Suporte prioritário', included: true },
      ],
    },
    {
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'Para clínicas de grande porte',
      monthlyPrice: 799,
      yearlyPrice: 799 * 10, // 2 meses grátis
      icon: <Building2 className="h-6 w-6" />,
      cta: 'Começar Trial de 14 dias',
      features: [
        { name: 'Usuários ilimitados', included: true },
        { name: 'Pets ilimitados', included: true },
        { name: 'Consultas ilimitadas', included: true },
        { name: 'Agendamentos', included: true },
        { name: 'Cadastro de pets e tutores', included: true },
        { name: 'Gestão de estoque', included: true },
        { name: 'Internações', included: true },
        { name: 'RAM (Monitoramento Anestésico)', included: true },
        { name: 'Exames laboratoriais', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'WhatsApp integrado', included: true },
        { name: 'API de integração', included: true },
        { name: 'Personalizações', included: true },
        { name: 'Suporte 24x7', included: true },
      ],
    },
  ];

  const handleSelectPlan = (planSlug: string) => {
    router.push(`/signup?plan=${planSlug}`);
  };

  const getPrice = (plan: Plan) => {
    return billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return null;
    const yearlyTotal = plan.monthlyPrice * 12;
    const savings = yearlyTotal - plan.yearlyPrice;
    return savings;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              Z
            </div>
            <span className="text-2xl font-bold text-primary">Zoa Pets</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-primary">
              Preços
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Começar Grátis</Link>
            </Button>
          </nav>
          <div className="md:hidden flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Planos que crescem com sua clínica
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Escolha o plano ideal para sua clínica veterinária. Todos com 14 dias de teste grátis.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingInterval === 'yearly'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Economize 2 meses
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.slug}
              className={`relative flex flex-col ${
                plan.popular ? 'border-primary border-2 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  {plan.icon}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {billingInterval === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  {billingInterval === 'yearly' && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Economize R$ {getSavings(plan)}/ano
                    </p>
                  )}
                  {billingInterval === 'yearly' && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cobrado R$ {plan.yearlyPrice}/ano
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.slug)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="Como funciona o período de teste?"
              answer="Todos os planos pagos incluem 14 dias de teste grátis. Você pode começar a usar todas as funcionalidades imediatamente, sem precisar de cartão de crédito. Após o período de teste, você pode escolher continuar com o plano ou cancelar sem custos."
            />
            <FAQItem
              question="Posso mudar de plano depois?"
              answer="Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O upgrade é aplicado imediatamente, e o downgrade entra em vigor no próximo ciclo de cobrança."
            />
            <FAQItem
              question="Como funciona a cobrança?"
              answer="A cobrança é feita mensalmente ou anualmente via Mercado Pago. Aceitamos Pix, cartão de crédito e boleto. Você receberá uma notificação antes de cada cobrança."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. Seus dados ficarão disponíveis por 30 dias após o cancelamento."
            />
            <FAQItem
              question="Os dados ficam seguros?"
              answer="Sim, utilizamos criptografia de ponta a ponta e fazemos backup diário automático. Estamos em conformidade com a LGPD e todas as regulamentações de proteção de dados."
            />
            <FAQItem
              question="Preciso instalar algum software?"
              answer="Não! Zoa Pets é 100% online. Basta acessar pelo navegador de qualquer computador, tablet ou smartphone."
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Comece grátis agora e transforme a gestão da sua clínica veterinária.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/signup">Criar Conta Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  Z
                </div>
                <span className="text-xl font-bold text-white">Zoa Pets</span>
              </div>
              <p className="text-sm text-gray-400">
                Sistema hospitalar veterinário completo para sua clínica.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors">Recursos</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Começar Grátis</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Zoa Pets. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
