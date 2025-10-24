'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BedDouble,
  Syringe,
  Dog,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Receipt,
  TrendingUp,
  BoxIcon,
  Activity,
  UserCog,
  Shield,
  Cog,
  TestTube,
  MessageSquare,
  ClipboardCheck,
  Wrench,
  Building2,
  Megaphone,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  badge?: string | number;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mensagens',
    href: '/mensagens',
    icon: MessageSquare,
  },
  {
    title: 'Clínico',
    icon: Activity,
    submenu: [
      { title: 'Consultas', href: '/consultas', icon: FileText },
      { title: 'Internações', href: '/internacoes', icon: BedDouble, badge: 12 },
      { title: 'Checklists', href: '/checklists', icon: ClipboardCheck },
      { title: 'RAM', href: '/ram', icon: Syringe, badge: 8 },
      { title: 'Exames', href: '/exames', icon: TestTube },
    ],
  },
  {
    title: 'Pacientes',
    icon: Dog,
    submenu: [
      { title: 'Pets', href: '/pets', icon: Dog },
      { title: 'Tutores', href: '/tutores', icon: Users },
    ],
  },
  {
    title: 'Agendamentos',
    href: '/agendamentos',
    icon: Calendar,
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    submenu: [
      { title: 'Contas', href: '/financeiro', icon: Receipt },
      { title: 'Pagamentos', href: '/pagamentos', icon: DollarSign },
      { title: 'Relatórios', href: '/financeiro/relatorios', icon: TrendingUp },
    ],
  },
  {
    title: 'Estoque',
    icon: Package,
    submenu: [
      { title: 'Produtos & Serviços', href: '/produtos', icon: Package },
      { title: 'Medicamentos', href: '/medicamentos', icon: BoxIcon },
      { title: 'Movimentações', href: '/estoque/movimentacoes', icon: Activity },
    ],
  },
  {
    title: 'Gestão',
    icon: Briefcase,
    submenu: [
      { title: 'SOPs', href: '/sops', icon: FileText },
      { title: 'Equipamentos', href: '/equipamentos', icon: Wrench },
      { title: 'Convênios', href: '/convenios', icon: Building2 },
      { title: 'Campanhas', href: '/campanhas', icon: Megaphone },
    ],
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: FileText,
  },
  {
    title: 'Configurações',
    icon: Settings,
    submenu: [
      { title: 'Escalas', href: '/escalas', icon: Calendar },
      { title: 'Usuários', href: '/configuracoes/usuarios', icon: UserCog },
      { title: 'Permissões', href: '/configuracoes/permissoes', icon: Shield },
      { title: 'Sistema', href: '/configuracoes/sistema', icon: Cog },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (submenu?: MenuItem[]) => {
    if (!submenu) return false;
    return submenu.some((item) => isActive(item.href));
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.href) || isParentActive(item.submenu);
    const Icon = item.icon;

    if (hasSubmenu) {
      return (
        <div key={item.title} className={cn('mb-1', depth > 0 && 'ml-4')}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between hover:bg-accent',
              active && 'bg-accent text-accent-foreground'
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />
            )}
          </Button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.submenu?.map((subItem) => renderMenuItem(subItem, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href || '#'} className={cn('mb-1', depth > 0 && 'ml-4')}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 hover:bg-accent',
            active && 'bg-primary text-primary-foreground hover:bg-primary/90',
            depth > 0 && 'pl-6'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-left font-medium">{item.title}</span>
          {item.badge && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white flex-shrink-0 mr-2">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    );
  };

  const getUserInitials = () => {
    if (!user?.nomeCompleto) return 'U';
    const names = user.nomeCompleto.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-background">
      {/* Logo & Branding */}
      <div className="border-b px-6 flex items-center" style={{ height: '64px', boxSizing: 'border-box' }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">
            Z
          </div>
          <div>
            <h1 className="text-lg font-bold">Zoa Pets</h1>
            <p className="text-xs text-muted-foreground">Sistema Hospitalar</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">{menuItems.map((item) => renderMenuItem(item))}</nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.nomeCompleto}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
