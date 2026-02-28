import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  CalendarPlus, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Bell,
  AlertTriangle,
  Info,
  MessageSquare,
  List
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { 
      icon: Clock, 
      label: "Ver Agenda", 
      description: "Agenda do dia",
      color: "bg-primary hover:bg-primary/90",
      path: "/agenda?view=day"
    },
    { 
      icon: MessageSquare, 
      label: "Comunicação", 
      description: "Sistema de comunicação",
      color: "bg-info hover:bg-info/90",
      path: "/comunicacao"
    },
    { 
      icon: CreditCard, 
      label: "Pagamento", 
      description: "Registrar pagamento",
      color: "bg-purple-500 hover:bg-purple-600",
      path: "/pagamentos"
    },
    { 
      icon: List, 
      label: "Lista de Agendamento", 
      description: "Ver todos agendamentos",
      color: "bg-warning hover:bg-warning/90",
      path: "/agenda"
    },
  ];

  const stats = [
    {
      title: "Consultas Hoje",
      value: "24",
      change: "+12%",
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-blue-500",
    },
    {
      title: "Pacientes Ativos",
      value: "1.284",
      change: "+8%",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
      iconBg: "bg-purple-500",
    },
    {
      title: "Agendamentos Pendentes",
      value: "18",
      change: "-5%",
      icon: CalendarClock,
      color: "bg-orange-500/10 text-orange-600",
      iconBg: "bg-orange-500",
    },
    {
      title: "Consultas Concluídas",
      value: "92%",
      change: "+3%",
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600",
      iconBg: "bg-green-500",
    },
  ];

  const recentAppointments = [
    { time: "09:00", patient: "Maria Silva", type: "Consulta", status: "confirmed" },
    { time: "10:30", patient: "João Santos", type: "Retorno", status: "confirmed" },
    { time: "14:00", patient: "Ana Costa", type: "Primeira Consulta", status: "pending" },
    { time: "15:30", patient: "Pedro Lima", type: "Consulta", status: "confirmed" },
  ];

  const alerts = [
    { 
      type: "info", 
      icon: Info,
      title: "Confirmações Pendentes",
      message: "3 pacientes aguardando confirmação",
      action: "Ver agendamentos"
    },
    { 
      type: "success", 
      icon: UserPlus,
      title: "Pacientes Novos",
      message: "12 novos pacientes cadastrados este mês",
      action: "Ver pacientes"
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base hidden sm:block">
            Bem-vindo ao CactoSaude! Aqui está um resumo do seu dia.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card className={`border-l-4 ${
                index === 0 ? 'border-l-primary' :
                index === 1 ? 'border-l-success' :
                index === 2 ? 'border-l-warning' :
                'border-l-info'
              } cursor-help hover:shadow-md transition-shadow`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.title}
                    <stat.icon className={`h-4 w-4 ${
                      index === 0 ? 'text-primary' :
                      index === 1 ? 'text-success' :
                      index === 2 ? 'text-warning' :
                      'text-info'
                    }`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-primary' :
                    index === 1 ? 'text-success' :
                    index === 2 ? 'text-warning' :
                    'text-info'
                  }`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-success font-medium">{stat.change}</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm" sideOffset={8}>
              <div className="space-y-1.5 min-w-[200px]">
                <p className="font-semibold text-sm whitespace-nowrap">{stat.title}</p>
                <p className="text-xs break-words leading-relaxed">
                  {index === 0 && "Número total de consultas agendadas para o dia de hoje. Inclui consultas confirmadas e pendentes de confirmação."}
                  {index === 1 && "Total de pacientes que tiveram pelo menos uma consulta nos últimos 30 dias. Pacientes com consultas regulares."}
                  {index === 2 && "Agendamentos que ainda não foram confirmados pelos pacientes. É importante acompanhar para reduzir faltas."}
                  {index === 3 && "Percentual de consultas agendadas que foram efetivamente realizadas. Meta ideal: acima de 90%."}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert, index) => (
          <Card key={index} className={`border-l-4 ${
            alert.type === 'warning' ? 'border-l-warning bg-warning/5' : 
            alert.type === 'error' ? 'border-l-destructive bg-destructive/5' :
            alert.type === 'success' ? 'border-l-success bg-success/5' :
            'border-l-info bg-info/5'
          } hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  alert.type === 'warning' ? 'bg-warning/10' : 
                  alert.type === 'error' ? 'bg-destructive/10' :
                  alert.type === 'success' ? 'bg-success/10' :
                  'bg-info/10'
                }`}>
                  <alert.icon className={`h-5 w-5 ${
                    alert.type === 'warning' ? 'text-warning' : 
                    alert.type === 'error' ? 'text-destructive' :
                    alert.type === 'success' ? 'text-success' :
                    'text-info'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 px-3 transition-all duration-200 ${
                      alert.type === 'warning' ? 'hover:bg-warning/20 hover:text-warning hover:shadow-sm text-warning/80' : 
                      alert.type === 'error' ? 'hover:bg-destructive/20 hover:text-destructive hover:shadow-sm text-destructive/80' :
                      alert.type === 'success' ? 'hover:bg-success/20 hover:text-success hover:shadow-sm text-success/80' :
                      'hover:bg-info/20 hover:text-info hover:shadow-sm text-info/80'
                    }`}
                    onClick={() => {
                      if (alert.type === 'info') {
                        // Para "Confirmações Pendentes" - navegar para Agenda com filtro de status pendente
                        navigate('/agenda?status=pending');
                      } else if (alert.type === 'success') {
                        // Para "Pacientes Novos" - não há filtro específico, apenas navegar
                        navigate('/pacientes');
                      } else {
                        navigate('/agenda');
                      }
                    }}
                  >
                    <span className="flex items-center gap-1 group">
                      {alert.action}
                      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Ações Rápidas</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              className={`h-auto flex-col items-start gap-2 p-6 ${action.color} text-white hover:shadow-lg transition-all`}
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">{action.label}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Agendamentos para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-h-[72px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold text-primary">{appointment.time}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === "confirmed"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nova consulta registrada", time: "Há 5 minutos", icon: FileText },
                { action: "Paciente cadastrado", time: "Há 15 minutos", icon: UserPlus },
                { action: "Agendamento confirmado", time: "Há 30 minutos", icon: CheckCircle2 },
                { action: "Relatório gerado", time: "Há 1 hora", icon: TrendingUp },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-h-[72px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="h-5"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
