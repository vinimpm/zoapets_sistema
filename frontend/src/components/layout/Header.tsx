'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/internacoes': 'Internações',
  '/ram': 'RAM',
  '/pets': 'Pets',
  '/tutores': 'Tutores',
  '/agendamentos': 'Agendamentos',
  '/exames': 'Exames',
  '/financeiro': 'Financeiro',
  '/pagamentos': 'Pagamentos',
  '/medicamentos': 'Medicamentos',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
  '/usuarios': 'Usuários',
  '/permissoes': 'Permissões',
  '/sistema': 'Sistema',
  '/movimentacoes': 'Movimentações',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getUserInitials = () => {
    if (!user?.nomeCompleto) return 'U';
    const names = user.nomeCompleto.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Mock notifications - será substituído por dados reais
  const notifications = [
    { id: 1, title: 'Medicação atrasada', message: 'Rex - Antibiótico às 14:00', time: '5 min atrás' },
    { id: 2, title: 'Paciente crítico', message: 'Mimi - Sinais vitais alterados', time: '15 min atrás' },
    { id: 3, title: 'Nova internação', message: 'Thor internado para cirurgia', time: '1 hora atrás' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-6 border-b" style={{ height: '64px', boxSizing: 'border-box' }}>
        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium">{item.label}</span>
              ) : (
                <button
                  onClick={() => item.href && router.push(item.href)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes..."
            className="pl-8"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{notification.message}</span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left lg:flex">
                <span className="text-sm font-medium">{user?.nomeCompleto}</span>
                <span className="text-xs text-muted-foreground">{user?.cargo || 'Veterinário'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/perfil')}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
