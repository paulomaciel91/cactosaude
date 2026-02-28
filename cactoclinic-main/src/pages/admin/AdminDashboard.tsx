import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Activity, TrendingUp, Shield, DollarSign, TrendingDown, Ticket, ArrowUp, ArrowDown, Download, Calendar, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState("month");

  const stats = [
    {
      title: "Total de Clínicas Ativas",
      value: "48",
      change: "+6",
      changeType: "positive",
      icon: Building2,
      color: "bg-blue-500/10 text-blue-600",
      description: "Clínicas com assinatura ativa",
      link: "/admin/clinicas",
    },
    {
      title: "Receita Recorrente (MRR)",
      value: "R$ 67.000",
      change: "+22%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-green-500/10 text-green-600",
      description: "Receita mensal recorrente",
      link: "/admin/assinaturas",
    },
    {
      title: "Novas Assinaturas",
      value: "12",
      change: "+3",
      changeType: "positive",
      icon: ArrowUp,
      color: "bg-purple-500/10 text-purple-600",
      description: "Este mês",
      link: "/admin/assinaturas",
    },
    {
      title: "Churn Rate",
      value: "2.1%",
      change: "-0.5%",
      changeType: "positive",
      icon: TrendingDown,
      color: "bg-orange-500/10 text-orange-600",
      description: "Taxa de cancelamento",
      link: "/admin/assinaturas",
    },
    {
      title: "Tickets de Suporte",
      value: "23",
      change: "8 abertos",
      changeType: "neutral",
      icon: Ticket,
      color: "bg-yellow-500/10 text-yellow-600",
      description: "Tickets em aberto",
      link: "/admin/suporte",
    },
    {
      title: "Usuários Ativos",
      value: "1.847",
      change: "+156",
      changeType: "positive",
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-600",
      description: "Últimos 30 dias",
      link: "/admin/usuarios",
    },
  ];

  const recentClinics = [
    { id: 1, name: "Clínica Vida Saudável", users: 24, status: "active", date: "2024-01-15", revenue: 1890 },
    { id: 2, name: "Centro Médico São Lucas", users: 18, status: "active", date: "2024-01-14", revenue: 890 },
    { id: 3, name: "Odonto Excellence", users: 12, status: "pending", date: "2024-01-13", revenue: 390 },
    { id: 4, name: "NutriCare", users: 8, status: "active", date: "2024-01-12", revenue: 890 },
  ];

  const revenueData = useMemo(() => {
    const baseData = [
      { month: "Jan", value: 45000 },
      { month: "Fev", value: 52000 },
      { month: "Mar", value: 48000 },
      { month: "Abr", value: 61000 },
      { month: "Mai", value: 55000 },
      { month: "Jun", value: 67000 },
    ];
    
    if (periodFilter === "week") {
      return [
        { day: "Seg", value: 2100 },
        { day: "Ter", value: 2300 },
        { day: "Qua", value: 2200 },
        { day: "Qui", value: 2500 },
        { day: "Sex", value: 2400 },
        { day: "Sáb", value: 1800 },
        { day: "Dom", value: 1500 },
      ];
    }
    return baseData;
  }, [periodFilter]);

  const clinicsGrowthData = [
    { month: "Jan", clinicas: 42 },
    { month: "Fev", clinicas: 44 },
    { month: "Mar", clinicas: 45 },
    { month: "Abr", clinicas: 46 },
    { month: "Mai", clinicas: 47 },
    { month: "Jun", clinicas: 48 },
  ];

  const handleExportData = () => {
    toast.success("Exportando dados do dashboard...");
    // Simulação de exportação
    setTimeout(() => {
      toast.success("Dados exportados com sucesso!");
    }, 1000);
  };

  const handleViewClinic = (clinicId: number) => {
    navigate(`/admin/clinicas`, { state: { viewClinicId: clinicId } });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento centralizado de todas as clínicas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const borderColors = ['border-l-primary', 'border-l-success', 'border-l-warning', 'border-l-info', 'border-l-warning', 'border-l-info'];
          const textColors = ['text-primary', 'text-success', 'text-warning', 'text-info', 'text-warning', 'text-info'];
          return (
          <Card 
            key={index} 
              className={`border-l-4 ${borderColors[index]} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.color}`}>
                  <stat.icon className={`h-4 w-4 ${textColors[index]}`} />
              </div>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold ${textColors[index]}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.changeType === "positive" ? (
                  <>
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-success font-medium">{stat.change}</span>
                  </>
                ) : stat.changeType === "negative" ? (
                  <>
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      <span className="text-destructive font-medium">{stat.change}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{stat.change}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Evolução da receita no período selecionado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey={periodFilter === "week" ? "day" : "month"} 
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Clínicas</CardTitle>
            <CardDescription>Número de clínicas ativas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clinicsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="clinicas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clinics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clínicas Recentes</CardTitle>
              <CardDescription>Últimas clínicas cadastradas no sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/clinicas")} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleViewClinic(clinic.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{clinic.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {clinic.users} usuários • R$ {clinic.revenue.toLocaleString('pt-BR')}/mês
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        clinic.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {clinic.status === "active" ? "Ativa" : "Pendente"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{clinic.date}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    handleViewClinic(clinic.id);
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
