import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock,
  X, 
  XCircle, 
  Edit, 
  RotateCcw,
  FileText,
  Download,
  AlertTriangle,
  Building2,
  Receipt,
  Calendar,
  TrendingUp,
  Users
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { tissIntegrations } from '@/lib/tissIntegrations';

interface Payment {
  id: number;
  patient: string;
  patientId?: number;
  service: string;
  amount: number;
  totalAmount?: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  method: string;
  installments?: number;
  currentInstallment?: number;
  healthInsurance?: string;
  receiptNumber?: string;
  notes?: string;
  installmentsList?: Array<{
    number: number;
    amount: number;
    dueDate: string;
    status: "paid" | "pending" | "overdue";
    paidDate?: string;
  }>;
}

const Pagamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form states
  const [formData, setFormData] = useState({
    patient: "",
    patientId: "",
    service: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    method: "",
    status: "pending",
    installments: "1",
    healthInsurance: "",
    notes: "",
  });

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      patient: "Maria Silva",
      patientId: 1,
      service: "Consulta",
      amount: 250.00,
      totalAmount: 250.00,
      date: "2024-01-15",
      dueDate: "2024-01-15",
      status: "paid",
      method: "Cartão de Crédito",
      installments: 1,
      currentInstallment: 1,
      healthInsurance: "Unimed",
      receiptNumber: "REC-2024-0001",
      installmentsList: [
        { number: 1, amount: 250.00, dueDate: "2024-01-15", status: "paid", paidDate: "2024-01-15" }
      ]
    },
    {
      id: 2,
      patient: "Pedro Costa",
      patientId: 2,
      service: "Procedimento Estético",
      amount: 150.00,
      totalAmount: 450.00,
      date: "2024-01-15",
      dueDate: "2024-01-20",
      status: "pending",
      method: "Parcelado",
      installments: 3,
      currentInstallment: 1,
      healthInsurance: "Particular",
      receiptNumber: "REC-2024-0002",
      installmentsList: [
        { number: 1, amount: 150.00, dueDate: "2024-01-20", status: "pending" },
        { number: 2, amount: 150.00, dueDate: "2024-02-20", status: "pending" },
        { number: 3, amount: 150.00, dueDate: "2024-03-20", status: "pending" }
      ]
    },
    {
      id: 3,
      patient: "Julia Oliveira",
      patientId: 3,
      service: "Consulta Especializada",
      amount: 450.00,
      totalAmount: 450.00,
      date: "2024-01-14",
      dueDate: "2024-01-14",
      status: "paid",
      method: "PIX",
      installments: 1,
      currentInstallment: 1,
      healthInsurance: "Bradesco Saúde",
      receiptNumber: "REC-2024-0003",
      installmentsList: [
        { number: 1, amount: 450.00, dueDate: "2024-01-14", status: "paid", paidDate: "2024-01-14" }
      ]
    },
    {
      id: 4,
      patient: "Roberto Alves",
      patientId: 4,
      service: "Consulta",
      amount: 250.00,
      totalAmount: 250.00,
      date: "2024-01-10",
      dueDate: "2024-01-15",
      status: "overdue",
      method: "A definir",
      installments: 1,
      currentInstallment: 1,
      healthInsurance: "Particular",
      receiptNumber: "REC-2024-0004",
      installmentsList: [
        { number: 1, amount: 250.00, dueDate: "2024-01-15", status: "overdue" }
      ]
    },
  ]);

  const patients = [
    { id: 1, name: "Maria Silva", healthInsurance: "Unimed" },
    { id: 2, name: "Pedro Costa", healthInsurance: "Particular" },
    { id: 3, name: "Julia Oliveira", healthInsurance: "Bradesco Saúde" },
    { id: 4, name: "Roberto Alves", healthInsurance: "Particular" },
  ];

  const healthInsurances = [
    "Particular",
    "Unimed",
    "Bradesco Saúde",
    "Amil",
    "SulAmérica",
    "NotreDame Intermédica",
  ];

  const paymentMethods = [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Transferência Bancária",
    "Boleto",
    "Plano de Saúde",
    "A definir"
  ];

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalReceived = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pending = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const overdue = payments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === "paid").length;
    const conversionRate = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;
    
    return {
      totalReceived,
      pending,
      overdue,
      conversionRate,
      pendingCount: payments.filter(p => p.status === "pending").length,
      overdueCount: payments.filter(p => p.status === "overdue").length,
    };
  }, [payments]);

  const handleConfirmPayment = (paymentId: number) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        const updatedInstallments = payment.installmentsList?.map(inst => 
          inst.number === payment.currentInstallment 
            ? { ...inst, status: "paid" as const, paidDate: new Date().toISOString().split('T')[0] }
            : inst
        );
        
        const allPaid = updatedInstallments?.every(inst => inst.status === "paid");
        const nextInstallment = updatedInstallments?.find(inst => inst.status === "pending");
        
        return {
          ...payment,
          status: allPaid ? "paid" as const : "pending" as const,
          currentInstallment: nextInstallment?.number || payment.currentInstallment,
          installmentsList: updatedInstallments,
        };
      }
      return payment;
    });
    setPayments(updatedPayments);
    
    if (selectedPayment && selectedPayment.id === paymentId) {
      const updated = updatedPayments.find(p => p.id === paymentId);
      if (updated) setSelectedPayment(updated);
    }
    
    toast.success("Pagamento confirmado com sucesso!");
  };

  const handleRevertPayment = (paymentId: number) => {
    const updatedPayments = payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: "pending" as const }
        : payment
    );
    setPayments(updatedPayments);
    
    if (selectedPayment && selectedPayment.id === paymentId) {
      setSelectedPayment({ ...selectedPayment, status: "pending" as const });
    }
    
    toast.success("Pagamento revertido para pendente!");
  };

  const handleSubmitPayment = () => {
    // Validação dos campos obrigatórios com mensagens específicas
    if (!formData.patientId) {
      toast.error("Selecione um paciente");
      return;
    }
    if (!formData.service) {
      toast.error("Selecione um serviço");
      return;
    }
    if (!formData.amount || formData.amount.trim() === '') {
      toast.error("Informe o valor do pagamento");
      return;
    }
    if (!formData.dueDate) {
      toast.error("Informe a data de vencimento");
      return;
    }
    if (!formData.method) {
      toast.error("Selecione a forma de pagamento");
      return;
    }
    if (!formData.date) {
      toast.error("Informe a data do pagamento");
      return;
    }

    // Validar valor
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("O valor deve ser maior que zero");
      return;
    }

    // Validar parcelas
    const installments = parseInt(formData.installments) || 1;
    if (installments < 1 || installments > 12) {
      toast.error("O número de parcelas deve estar entre 1 e 12");
      return;
    }

    const installmentAmount = amount / installments;
    // Calcular próximo ID de forma segura
    const nextId = payments.length > 0 
      ? Math.max(...payments.map(p => p.id)) + 1 
      : 1;
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;
    
    // Gerar lista de parcelas
    const installmentsList = [];
    const baseDate = new Date(formData.dueDate);
    
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installmentsList.push({
        number: i + 1,
        amount: parseFloat(installmentAmount.toFixed(2)),
        dueDate: dueDate.toISOString().split('T')[0],
        status: formData.status === "paid" && i === 0 ? "paid" as const : "pending" as const,
        paidDate: formData.status === "paid" && i === 0 ? formData.date : undefined,
      });
    }

    const selectedPatient = patients.find(p => p.id.toString() === formData.patientId);
    
    if (!selectedPatient) {
      toast.error("Paciente não encontrado");
      return;
    }

    // Determinar status inicial baseado na data de vencimento
    let initialStatus: "paid" | "pending" | "overdue" = formData.status as "paid" | "pending" | "overdue";
    if (initialStatus === "pending") {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        initialStatus = "overdue";
      }
    }
    
    const newPayment: Payment = {
      id: nextId,
      patient: selectedPatient.name,
      patientId: parseInt(formData.patientId),
      service: formData.service,
      amount: parseFloat(installmentAmount.toFixed(2)),
      totalAmount: parseFloat(amount.toFixed(2)),
      date: formData.date,
      dueDate: formData.dueDate,
      status: initialStatus,
      method: formData.method,
      installments: installments,
      currentInstallment: formData.status === "paid" ? installments : 1,
      healthInsurance: formData.healthInsurance && formData.healthInsurance !== "none" ? formData.healthInsurance : selectedPatient.healthInsurance,
      receiptNumber: receiptNumber,
      notes: formData.notes || undefined,
      installmentsList: installmentsList,
    };

    try {
      // Usar função de callback para garantir que o estado seja atualizado corretamente
      setPayments(prevPayments => [...prevPayments, newPayment]);
      toast.success(`Pagamento registrado com sucesso! Recibo: ${receiptNumber}`);
      
      // Reset form
      const resetFormData = {
        patient: "",
        patientId: "",
        service: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        dueDate: "",
        method: "",
        status: "pending",
        installments: "1",
        healthInsurance: "",
        notes: "",
      };
      setFormData(resetFormData);
      
      // Fechar dialog após um pequeno delay para garantir que o toast seja exibido
      setTimeout(() => {
        setOpen(false);
      }, 300);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error("Erro ao registrar pagamento. Tente novamente.");
    }
  };

  const generateReceipt = (payment: Payment) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar texto
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          const xPosition = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
          doc.text(line, xPosition, yPosition, { align });
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Cabeçalho
      addText('RECIBO DE PAGAMENTO', 18, true, [21, 128, 61], 'center');
      yPosition += 5;
      
      // Linha divisória
      doc.setDrawColor(21, 128, 61);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Número do recibo
      addText(`Nº ${payment.receiptNumber}`, 12, true, [0, 0, 0], 'right');
      yPosition += 5;

      // Informações do pagamento
      addText('DADOS DO PAGAMENTO', 12, true);
      addText(`Paciente: ${payment.patient}`, 10, false);
      addText(`Serviço: ${payment.service}`, 10, false);
      if (payment.healthInsurance) {
        addText(`Plano de Saúde: ${payment.healthInsurance}`, 10, false);
      }
      yPosition += 5;

      // Valores
      addText('VALORES', 12, true);
      addText(`Valor Total: R$ ${payment.totalAmount?.toFixed(2) || payment.amount.toFixed(2)}`, 10, true);
      if (payment.installments && payment.installments > 1) {
        addText(`Parcelas: ${payment.installments}x de R$ ${payment.amount.toFixed(2)}`, 10, false);
        addText(`Parcela Atual: ${payment.currentInstallment}/${payment.installments}`, 10, false);
      }
      addText(`Valor Pago: R$ ${payment.amount.toFixed(2)}`, 10, true, [21, 128, 61]);
      yPosition += 5;

      // Forma de pagamento e datas
      addText('FORMA DE PAGAMENTO E DATAS', 12, true);
      addText(`Forma: ${payment.method}`, 10, false);
      addText(`Data do Pagamento: ${new Date(payment.date).toLocaleDateString('pt-BR')}`, 10, false);
      addText(`Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}`, 10, false);
      yPosition += 5;

      // Status
      const statusText = payment.status === "paid" ? "PAGO" : payment.status === "pending" ? "PENDENTE" : "ATRASADO";
      const statusColor = payment.status === "paid" ? [21, 128, 61] : payment.status === "pending" ? [245, 158, 11] : [239, 68, 68];
      addText(`Status: ${statusText}`, 12, true, statusColor);
      yPosition += 10;

      // Observações
      if (payment.notes) {
        addText('OBSERVAÇÕES', 12, true);
        addText(payment.notes, 10, false);
        yPosition += 5;
      }

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerText = `Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude - Sistema de Gestão Médica`;
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

      // Salvar PDF
      const fileName = `recibo_${payment.receiptNumber}.pdf`;
      doc.save(fileName);
      toast.success("Recibo gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      toast.error("Erro ao gerar recibo. Tente novamente.");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { label: "Pago", className: "bg-success/10 text-success hover:bg-success/20", icon: CheckCircle },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning hover:bg-warning/20", icon: Clock },
      overdue: { label: "Atrasado", className: "bg-destructive/10 text-destructive hover:bg-destructive/20", icon: XCircle },
    };
    const variant = variants[status as keyof typeof variants];
    const Icon = variant.icon;
    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId);
    if (patient) {
      setFormData({
        ...formData,
        patientId: patientId,
        healthInsurance: patient.healthInsurance,
      });
    }
  };

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <CreditCard className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Pagamentos</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
              Gerencie pagamentos, parcelamentos e inadimplência
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Resetar formulário ao fechar apenas se não foi um registro bem-sucedido
            setFormData({
              patient: "",
              patientId: "",
              service: "",
              amount: "",
              date: new Date().toISOString().split('T')[0],
              dueDate: "",
              method: "",
              status: "pending",
              installments: "1",
              healthInsurance: "",
              notes: "",
            });
          }
          setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>
                Registre um novo pagamento no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Paciente *</Label>
                <Select value={formData.patientId} onValueChange={handlePatientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} - {patient.healthInsurance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service">Serviço *</Label>
                <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Procedimento Estético">Procedimento Estético</SelectItem>
                    <SelectItem value="Consulta Especializada">Consulta Especializada</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                    <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor Total (R$) *</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01"
                    placeholder="0,00" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input 
                    id="installments" 
                    type="number" 
                    min="1"
                    max="12"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Data do Pagamento *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Vencimento *</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Forma de Pagamento *</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="healthInsurance">Plano de Saúde</Label>
                <Select value={formData.healthInsurance || undefined} onValueChange={(value) => {
                  setFormData({ ...formData, healthInsurance: value === "none" ? "" : value });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não aplicável</SelectItem>
                    {healthInsurances.map((insurance) => (
                      <SelectItem key={insurance} value={insurance}>
                        {insurance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Input 
                  id="notes" 
                  placeholder="Observações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {formData.amount && formData.installments && parseInt(formData.installments) > 1 && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <p className="text-sm font-semibold mb-2">Resumo do Parcelamento:</p>
                  <p className="text-xs text-muted-foreground">
                    {formData.installments}x de R$ {(parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmitPayment();
                }}
                type="button"
                className="bg-primary hover:bg-primary/90"
              >
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Recebido
              <DollarSign className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {stats.totalReceived.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Pendentes
              <Clock className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ {stats.pending.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} pagamentos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Atrasados
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {stats.overdue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.overdueCount} pagamentos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Conversão
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Pagamentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, serviço ou recibo..."
                  className="pl-10 pr-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="scrollbar-hide-x">
          <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[800px] lg:min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Recibo</TableHead>
                <TableHead className="font-semibold">Paciente</TableHead>
                <TableHead className="font-semibold">Serviço</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Parcelas</TableHead>
                <TableHead className="font-semibold">Vencimento</TableHead>
                <TableHead className="font-semibold">Método</TableHead>
                <TableHead className="font-semibold">Plano</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/30 border-b">
                  <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                  <TableCell className="font-medium">{payment.patient}</TableCell>
                  <TableCell>{payment.service}</TableCell>
                  <TableCell className="font-semibold">
                    R$ {payment.amount.toFixed(2).replace('.', ',')}
                    {payment.installments && payment.installments > 1 && (
                      <span className="text-xs text-muted-foreground block">
                        Total: R$ {payment.totalAmount?.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.installments && payment.installments > 1 ? (
                      <Badge variant="outline" className="text-xs">
                        {payment.currentInstallment}/{payment.installments}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    {payment.healthInsurance ? (
                      <Badge 
                        variant={payment.healthInsurance === "Particular" ? "outline" : "default"}
                        className={`text-xs ${
                          payment.healthInsurance === "Particular" 
                            ? "bg-muted/50 text-muted-foreground border-muted-foreground/30" 
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {payment.healthInsurance}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 min-h-[44px] min-w-[44px] bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-700"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setDetailsOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 text-purple-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalhes</p>
                        </TooltipContent>
                      </Tooltip>
                      {payment.status === "paid" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 min-h-[44px] min-w-[44px] bg-success/10 text-success hover:bg-success/20 hover:text-success"
                              onClick={() => generateReceipt(payment)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Baixar recibo</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {payment.status === "pending" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 min-h-[44px] min-w-[44px] bg-success/10 text-success hover:bg-success/20 hover:text-success"
                              onClick={() => handleConfirmPayment(payment.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Confirmar pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {payment.status === "paid" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 min-h-[44px] min-w-[44px] bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                              onClick={() => handleRevertPayment(payment.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reverter pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
              Informações completas do pagamento #{selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="installments">Parcelas</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Número do Recibo</Label>
                    <p className="text-sm font-mono">{selectedPayment.receiptNumber}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Paciente</Label>
                    <p className="text-sm text-muted-foreground">{selectedPayment.patient}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Serviço</Label>
                    <p className="text-sm text-muted-foreground">{selectedPayment.service}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Valor</Label>
                      <p className="text-sm font-semibold text-foreground">
                        R$ {selectedPayment.amount.toFixed(2).replace('.', ',')}
                      </p>
                      {selectedPayment.totalAmount && selectedPayment.totalAmount !== selectedPayment.amount && (
                        <p className="text-xs text-muted-foreground">
                          Total: R$ {selectedPayment.totalAmount.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Status</Label>
                      <div>{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Data</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedPayment.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Vencimento</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedPayment.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Forma de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">{selectedPayment.method}</p>
                  </div>
                  {selectedPayment.healthInsurance && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Plano de Saúde</Label>
                      <Badge 
                        variant={selectedPayment.healthInsurance === "Particular" ? "outline" : "default"}
                        className={
                          selectedPayment.healthInsurance === "Particular" 
                            ? "bg-muted/50 text-muted-foreground border-muted-foreground/30" 
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {selectedPayment.healthInsurance}
                      </Badge>
                    </div>
                  )}
                  {selectedPayment.notes && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Observações</Label>
                      <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="installments" className="space-y-4 mt-4">
                {selectedPayment.installmentsList && selectedPayment.installmentsList.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayment.installmentsList.map((installment, idx) => (
                      <Card key={idx} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                Parcela {installment.number}/{selectedPayment.installments}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Vencimento: {new Date(installment.dueDate).toLocaleDateString("pt-BR")}
                              </p>
                              {installment.paidDate && (
                                <p className="text-xs text-success mt-1">
                                  Pago em: {new Date(installment.paidDate).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">R$ {installment.amount.toFixed(2).replace('.', ',')}</p>
                              {getStatusBadge(installment.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma parcela registrada</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Card className="border-l-4 border-l-info">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Pagamento Registrado</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(selectedPayment.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline">Registrado</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  {selectedPayment.status === "paid" && (
                    <Card className="border-l-4 border-l-success">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">Pagamento Confirmado</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(selectedPayment.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge className="bg-success/10 text-success">Confirmado</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
            {selectedPayment?.status === "paid" && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (selectedPayment) generateReceipt(selectedPayment);
                }}
                className="bg-success/10 text-success hover:bg-success/20 hover:text-success"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Recibo
              </Button>
            )}
            {selectedPayment?.status === "paid" && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (selectedPayment) handleRevertPayment(selectedPayment.id);
                }}
                className="bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reverter
              </Button>
            )}
            {selectedPayment?.status === "pending" && (
              <Button
                onClick={() => {
                  if (selectedPayment) handleConfirmPayment(selectedPayment.id);
                }}
                className="bg-success hover:bg-success/90 text-white"
              >
                Confirmar Pagamento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};

export default Pagamentos;
