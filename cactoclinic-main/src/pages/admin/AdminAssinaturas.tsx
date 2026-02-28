import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  X,
  Search,
  Download,
  Filter,
  Calendar,
  Eye,
  FileText
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Transaction {
  id: string;
  clinic: string;
  clinicId: number;
  type: "payment";
  plan: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
  invoiceUrl?: string;
}

interface ChangeRequest {
  id: string;
  clinic: string;
  clinicId: number;
  type: "status_change" | "plan_change";
  description: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

const AdminAssinaturas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: "TXN-001", 
      clinic: "Clínica Vida Saudável", 
      clinicId: 1,
      type: "payment", 
      plan: "Profissional", 
      amount: 890, 
      date: "2024-01-15", 
      status: "completed",
      method: "Cartão de Crédito",
      invoiceUrl: "#",
    },
    { 
      id: "TXN-002", 
      clinic: "Centro Médico São Lucas", 
      clinicId: 2,
      type: "payment", 
      plan: "Profissional", 
      amount: 890, 
      date: "2024-01-20", 
      status: "completed",
      method: "PIX",
      invoiceUrl: "#",
    },
    { 
      id: "TXN-003", 
      clinic: "Odonto Excellence", 
      clinicId: 3,
      type: "payment", 
      plan: "Profissional", 
      amount: 890, 
      date: "2024-01-10", 
      status: "completed",
      method: "Cartão de Crédito",
      invoiceUrl: "#",
    },
    { 
      id: "TXN-004", 
      clinic: "NutriCare", 
      clinicId: 4,
      type: "payment", 
      plan: "Profissional", 
      amount: 890, 
      date: "2024-01-05", 
      status: "pending",
      method: "Boleto",
      invoiceUrl: "#",
    },
    { 
      id: "TXN-005", 
      clinic: "Clínica Saúde Total", 
      clinicId: 5,
      type: "payment", 
      plan: "Profissional", 
      amount: 890, 
      date: "2023-12-28", 
      status: "failed",
      method: "Cartão de Crédito",
    },
  ]);

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([
    {
      id: "CHG-001",
      clinic: "Clínica Vida Saudável",
      clinicId: 1,
      type: "status_change",
      description: "Solicitação de reativação da assinatura",
      requestedAt: "2024-01-20 10:30:00",
      status: "pending",
    },
    {
      id: "CHG-002",
      clinic: "Odonto Excellence",
      clinicId: 3,
      type: "plan_change",
      description: "Solicitação de alteração de plano",
      requestedAt: "2024-01-19 14:20:00",
      status: "pending",
    },
  ]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.clinic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        if (dateFilter === "today") {
          matchesDate = transactionDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const completed = transactions.filter(t => t.status === "completed").length;
    const pending = transactions.filter(t => t.status === "pending").length;
    const totalRevenue = transactions
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      total,
      completed,
      pending,
      totalRevenue,
    };
  }, [transactions]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  };

  const handleApproveChange = (request: ChangeRequest) => {
    const updated = changeRequests.map(r =>
      r.id === request.id ? { ...r, status: "approved" as const } : r
    );
    setChangeRequests(updated);
    toast.success(`Alteração aprovada para ${request.clinic}`);
  };

  const handleRejectChange = (request: ChangeRequest) => {
    const updated = changeRequests.map(r =>
      r.id === request.id ? { ...r, status: "rejected" as const } : r
    );
    setChangeRequests(updated);
    toast.success(`Alteração recusada para ${request.clinic}`);
  };

  const handleExport = () => {
    toast.success("Exportando relatório de transações...");
    setTimeout(() => {
      toast.success("Relatório exportado com sucesso!");
    }, 1000);
  };

  const handleDownloadInvoice = (transaction: Transaction) => {
    toast.success(`Baixando nota fiscal: ${transaction.id}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Assinaturas</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar transações e histórico de pagamentos
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground mt-1">Transações concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Transações concluídas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="changes">
            Alterações
            {changeRequests.filter(r => r.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {changeRequests.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Histórico de Transações</CardTitle>
                  <CardDescription>
                    {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 'ões' : ''} encontrada{filteredTransactions.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo Período</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última Semana</SelectItem>
                      <SelectItem value="month">Último Mês</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="failed">Falhadas</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar transação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Clínica</TableHead>
                    <TableHead className="font-semibold">Plano</TableHead>
                    <TableHead className="font-semibold">Método</TableHead>
                    <TableHead className="font-semibold">Valor</TableHead>
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma transação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/30 border-b">
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell className="font-medium">{transaction.clinic}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{transaction.method}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            transaction.status === "completed" 
                              ? 'text-green-600' 
                              : transaction.status === "failed"
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }`}>
                            R$ {transaction.amount.toLocaleString('pt-BR')}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === "completed" 
                                ? "default" 
                                : transaction.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {transaction.status === "completed" ? "Concluída" : transaction.status === "failed" ? "Falhada" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewTransaction(transaction)}
                              className="h-8 w-8"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.invoiceUrl && transaction.status === "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadInvoice(transaction)}
                                className="h-8 w-8"
                                title="Baixar Nota Fiscal"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alterações */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Alterações</CardTitle>
              <CardDescription>
                {changeRequests.filter(r => r.status === "pending").length} solicitação{changeRequests.filter(r => r.status === "pending").length !== 1 ? 'ões' : ''} pendente{changeRequests.filter(r => r.status === "pending").length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma solicitação de alteração
                  </div>
                ) : (
                  changeRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 rounded-lg border ${
                        request.status === "pending" 
                          ? "bg-muted/50" 
                          : request.status === "approved"
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{request.clinic}</p>
                            <Badge 
                              variant={
                                request.status === "pending" 
                                  ? "default" 
                                  : request.status === "approved"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                request.status === "approved" 
                                  ? "bg-green-500/10 text-green-600"
                                  : ""
                              }
                            >
                              {request.status === "pending" 
                                ? "Pendente" 
                                : request.status === "approved"
                                ? "Aprovada"
                                : "Recusada"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{request.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Solicitado em: {new Date(request.requestedAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleRejectChange(request)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Recusar
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveChange(request)}
                            >
                              Aprovar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalhes da Transação - {selectedTransaction?.id}
            </DialogTitle>
            <DialogDescription>
              Informações completas da transação
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clínica</p>
                  <p className="font-medium">{selectedTransaction.clinic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <Badge variant="outline">{selectedTransaction.plan}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-bold text-lg text-green-600">
                    R$ {selectedTransaction.amount.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <p className="font-medium">{selectedTransaction.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {new Date(selectedTransaction.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={
                      selectedTransaction.status === "completed" 
                        ? "default" 
                        : selectedTransaction.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedTransaction.status === "completed" ? "Concluída" : selectedTransaction.status === "failed" ? "Falhada" : "Pendente"}
                  </Badge>
                </div>
              </div>
              {selectedTransaction.invoiceUrl && selectedTransaction.status === "completed" && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadInvoice(selectedTransaction)}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Baixar Nota Fiscal
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAssinaturas;
