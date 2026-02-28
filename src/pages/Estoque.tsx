import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X, 
  AlertCircle, 
  Package, 
  TrendingDown, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History,
  FileText,
  BarChart3,
  Calendar,
  Filter,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  supplier: string;
  lastPurchase: string;
  price: number;
}

interface Movement {
  id: number;
  itemId: number;
  itemName: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  user: string;
  reason?: string;
  supplier?: string;
  unitPrice?: number;
  totalPrice?: number;
}

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [movementsDialogOpen, setMovementsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [movementUser, setMovementUser] = useState("Dr. João Santos");
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);
  const [movementSupplier, setMovementSupplier] = useState("");
  const [movementUnitPrice, setMovementUnitPrice] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Lista de usuários disponíveis
  const availableUsers = [
    "Dr. João Santos",
    "Dra. Ana Lima",
    "Dr. Carlos Silva",
    "Dra. Maria Costa",
    "Dr. Pedro Oliveira",
    "Recepcionista - Maria",
    "Recepcionista - João"
  ];

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Luvas Descartáveis",
      category: "Proteção",
      quantity: 500,
      minQuantity: 200,
      unit: "unidade",
      supplier: "MedSupply",
      lastPurchase: "2024-01-10",
      price: 0.50
    },
    {
      id: 2,
      name: "Seringas 5ml",
      category: "Descartáveis",
      quantity: 150,
      minQuantity: 300,
      unit: "unidade",
      supplier: "MedSupply",
      lastPurchase: "2023-12-15",
      price: 0.80
    },
    {
      id: 3,
      name: "Álcool 70%",
      category: "Higienização",
      quantity: 45,
      minQuantity: 50,
      unit: "litro",
      supplier: "CleanMed",
      lastPurchase: "2024-01-05",
      price: 12.00
    },
    {
      id: 4,
      name: "Gaze Estéril",
      category: "Curativos",
      quantity: 800,
      minQuantity: 300,
      unit: "pacote",
      supplier: "MedSupply",
      lastPurchase: "2024-01-12",
      price: 2.50
    },
    {
      id: 5,
      name: "Agulhas 25x7",
      category: "Descartáveis",
      quantity: 1200,
      minQuantity: 500,
      unit: "unidade",
      supplier: "MedSupply",
      lastPurchase: "2024-01-08",
      price: 0.15
    },
    {
      id: 6,
      name: "Algodão",
      category: "Curativos",
      quantity: 250,
      minQuantity: 100,
      unit: "pacote",
      supplier: "MedSupply",
      lastPurchase: "2024-01-14",
      price: 3.20
    },
  ]);

  const [movements, setMovements] = useState<Movement[]>([
    {
      id: 1,
      itemId: 1,
      itemName: "Luvas Descartáveis",
      type: "entrada",
      quantity: 500,
      date: "2024-01-10",
      user: "Dr. João Santos",
      reason: "Compra regular"
    },
    {
      id: 2,
      itemId: 2,
      itemName: "Seringas 5ml",
      type: "saida",
      quantity: 50,
      date: "2024-01-12",
      user: "Dra. Ana Lima",
      reason: "Uso em consultas"
    },
    {
      id: 3,
      itemId: 3,
      itemName: "Álcool 70%",
      type: "entrada",
      quantity: 20,
      date: "2024-01-05",
      user: "Dr. João Santos",
      reason: "Reposição"
    },
    {
      id: 4,
      itemId: 4,
      itemName: "Gaze Estéril",
      type: "saida",
      quantity: 100,
      date: "2024-01-13",
      user: "Dra. Maria Costa",
      reason: "Procedimentos"
    },
    {
      id: 5,
      itemId: 1,
      itemName: "Luvas Descartáveis",
      type: "saida",
      quantity: 200,
      date: "2024-01-14",
      user: "Dr. João Santos",
      reason: "Uso diário"
    },
  ]);

  const categories = ["Proteção", "Descartáveis", "Higienização", "Curativos", "Medicamentos"];

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= minQuantity * 0.5) {
      return { label: "Crítico", className: "bg-destructive/10 text-destructive hover:bg-destructive/20", icon: AlertCircle };
    } else if (quantity <= minQuantity) {
      return { label: "Baixo", className: "bg-warning/10 text-warning hover:bg-warning/20", icon: TrendingDown };
    } else {
      return { label: "Normal", className: "bg-success/10 text-success hover:bg-success/20", icon: Package };
    }
  };

  // Filtrar inventário
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      
      let matchesStatus = true;
      if (filterStatus === "critical") {
        matchesStatus = item.quantity <= item.minQuantity * 0.5;
      } else if (filterStatus === "low") {
        matchesStatus = item.quantity > item.minQuantity * 0.5 && item.quantity <= item.minQuantity;
      } else if (filterStatus === "normal") {
        matchesStatus = item.quantity > item.minQuantity;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchTerm, filterCategory, filterStatus]);

  const criticalItems = inventory.filter(item => item.quantity <= item.minQuantity * 0.5);
  const lowItems = inventory.filter(item => item.quantity > item.minQuantity * 0.5 && item.quantity <= item.minQuantity);

  // Estatísticas
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const criticalCount = criticalItems.length;
    const lowCount = lowItems.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    return {
      totalItems,
      criticalCount,
      lowCount,
      totalValue
    };
  }, [inventory, criticalItems, lowItems]);

  // Relatórios de consumo
  const consumptionReport = useMemo(() => {
    const last30Days = movements.filter(m => {
      const movementDate = new Date(m.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return movementDate >= thirtyDaysAgo;
    });

    const consumptionByItem: Record<number, { name: string; entrada: number; saida: number; saldo: number }> = {};
    
    last30Days.forEach(movement => {
      if (!consumptionByItem[movement.itemId]) {
        consumptionByItem[movement.itemId] = {
          name: movement.itemName,
          entrada: 0,
          saida: 0,
          saldo: 0
        };
      }
      
      if (movement.type === "entrada") {
        consumptionByItem[movement.itemId].entrada += movement.quantity;
        consumptionByItem[movement.itemId].saldo += movement.quantity;
      } else {
        consumptionByItem[movement.itemId].saida += movement.quantity;
        consumptionByItem[movement.itemId].saldo -= movement.quantity;
      }
    });

    return Object.values(consumptionByItem).sort((a, b) => b.saida - a.saida);
  }, [movements]);

  // Handlers
  const handleEntry = () => {
    if (!selectedItem || !movementQuantity || parseFloat(movementQuantity) <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }

    if (!movementUser || !movementUser.trim()) {
      toast.error("O campo usuário é obrigatório");
      return;
    }

    if (!movementReason || !movementReason.trim()) {
      toast.error("O campo motivo/observações é obrigatório");
      return;
    }

    const quantity = parseFloat(movementQuantity);
    const updatedInventory = inventory.map(item =>
      item.id === selectedItem.id
        ? { ...item, quantity: item.quantity + quantity, lastPurchase: new Date().toISOString().split('T')[0] }
        : item
    );

    const unitPrice = movementUnitPrice ? parseFloat(movementUnitPrice) : selectedItem.price;
    const totalPrice = quantity * unitPrice;

    const newMovement: Movement = {
      id: movements.length + 1,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: "entrada",
      quantity: quantity,
      date: movementDate,
      user: movementUser.trim(),
      reason: movementReason.trim(),
      supplier: movementSupplier || selectedItem.supplier,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };

    // Atualizar preço do item se fornecido
    const updatedInventoryWithPrice = updatedInventory.map(item =>
      item.id === selectedItem.id && movementUnitPrice
        ? { ...item, price: unitPrice, supplier: movementSupplier || item.supplier }
        : item
    );

    setInventory(updatedInventoryWithPrice);
    setMovements([newMovement, ...movements]);
    setEntryDialogOpen(false);
    setSelectedItem(null);
    setMovementQuantity("");
    setMovementReason("");
    setMovementUser("Dr. João Santos");
    setMovementDate(new Date().toISOString().split('T')[0]);
    setMovementSupplier("");
    setMovementUnitPrice("");
    toast.success(`Entrada de ${quantity} ${selectedItem.unit} registrada`);
  };

  const handleExit = () => {
    if (!selectedItem || !movementQuantity || parseFloat(movementQuantity) <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }

    if (!movementUser || !movementUser.trim()) {
      toast.error("O campo usuário é obrigatório");
      return;
    }

    if (!movementReason || !movementReason.trim()) {
      toast.error("O campo motivo/observações é obrigatório");
      return;
    }

    const quantity = parseFloat(movementQuantity);
    if (selectedItem.quantity < quantity) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    const updatedInventory = inventory.map(item =>
      item.id === selectedItem.id
        ? { ...item, quantity: item.quantity - quantity }
        : item
    );

    const newMovement: Movement = {
      id: movements.length + 1,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: "saida",
      quantity: quantity,
      date: movementDate,
      user: movementUser.trim(),
      reason: movementReason.trim()
    };

    setInventory(updatedInventory);
    setMovements([newMovement, ...movements]);
    setExitDialogOpen(false);
    setSelectedItem(null);
    setMovementQuantity("");
    setMovementReason("");
    setMovementUser("Dr. João Santos");
    setMovementDate(new Date().toISOString().split('T')[0]);
    toast.success(`Saída de ${quantity} ${selectedItem.unit} registrada`);
  };

  const handleOpenEntry = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementQuantity("");
    setMovementReason("");
    setMovementUser("Dr. João Santos");
    setMovementDate(new Date().toISOString().split('T')[0]);
    setMovementSupplier(item.supplier);
    setMovementUnitPrice(item.price.toFixed(2));
    setEntryDialogOpen(true);
  };

  const handleOpenExit = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementQuantity("");
    setMovementReason("");
    setMovementUser("Dr. João Santos");
    setMovementDate(new Date().toISOString().split('T')[0]);
    setExitDialogOpen(true);
  };

  const handleOpenMovements = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementsDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setInventory(inventory.filter(i => i.id !== item.id));
    toast.success(`${item.name} removido do estoque`);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const itemMovements = useMemo(() => {
    if (!selectedItem) return [];
    return movements.filter(m => m.itemId === selectedItem.id).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [movements, selectedItem]);

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Controle de materiais e insumos
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Item no Estoque</DialogTitle>
              <DialogDescription>
                Adicione um novo item ao estoque
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input id="name" placeholder="Digite o nome do item" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protecao">Proteção</SelectItem>
                      <SelectItem value="descartaveis">Descartáveis</SelectItem>
                      <SelectItem value="higienizacao">Higienização</SelectItem>
                      <SelectItem value="curativos">Curativos</SelectItem>
                      <SelectItem value="medicamentos">Medicamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="pacote">Pacote</SelectItem>
                      <SelectItem value="litro">Litro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input id="quantity" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minQuantity">Estoque Mínimo</Label>
                  <Input id="minQuantity" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input id="supplier" placeholder="Nome do fornecedor" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Preço Unitário (R$)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0,00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success("Item adicionado ao estoque!");
                setOpen(false);
              }}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Itens
              <Package className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens cadastrados</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Estoque Crítico
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens críticos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Estoque Baixo
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Valor Total
              <DollarSign className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {stats.totalValue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Alertas de Estoque Mínimo */}
      {(criticalItems.length > 0 || lowItems.length > 0) && (
        <Card className="border-l-4 border-l-destructive shadow-lg bg-background">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-foreground mb-1.5">
                    Alertas de Estoque Mínimo
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Itens que precisam de reposição urgente ou atenção
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs font-semibold px-3 py-1.5 h-auto flex-shrink-0">
                {criticalItems.length + lowItems.length} {criticalItems.length + lowItems.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Itens Críticos */}
              {criticalItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <h4 className="font-bold text-sm text-destructive">
                      Estoque Crítico ({criticalItems.length})
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    {criticalItems.map(item => {
                      const status = getStockStatus(item.quantity, item.minQuantity);
                      const StatusIcon = status.icon;
                      const percentage = ((item.quantity / item.minQuantity) * 100).toFixed(0);
                      return (
                        <div 
                          key={item.id} 
                          className="group flex items-start justify-between p-4 rounded-lg bg-destructive/5 border-2 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => handleOpenEntry(item)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/25 transition-colors">
                              <StatusIcon className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-foreground truncate mb-1">{item.name}</p>
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold">{item.quantity}</span> {item.unit} / Mín: <span className="font-semibold">{item.minQuantity}</span> {item.unit}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-destructive rounded-full transition-all"
                                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-destructive whitespace-nowrap">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs font-bold ml-2 flex-shrink-0 px-2 py-0.5">
                            Crítico
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itens com Estoque Baixo */}
              {lowItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-warning/20 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <h4 className="font-bold text-sm text-warning">
                      Estoque Baixo ({lowItems.length})
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    {lowItems.map(item => {
                      const status = getStockStatus(item.quantity, item.minQuantity);
                      const StatusIcon = status.icon;
                      const percentage = ((item.quantity / item.minQuantity) * 100).toFixed(0);
                      return (
                        <div 
                          key={item.id} 
                          className="group flex items-start justify-between p-4 rounded-lg bg-warning/5 border-2 border-warning/20 hover:bg-warning/10 hover:border-warning/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => handleOpenEntry(item)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0 group-hover:bg-warning/25 transition-colors">
                              <StatusIcon className="h-5 w-5 text-warning" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-foreground truncate mb-1">{item.name}</p>
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold">{item.quantity}</span> {item.unit} / Mín: <span className="font-semibold">{item.minQuantity}</span> {item.unit}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-warning rounded-full transition-all"
                                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-warning whitespace-nowrap">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs font-bold ml-2 border-warning text-warning bg-warning/10 flex-shrink-0 px-2 py-0.5">
                            Baixo
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Tab: Estoque */}
        <TabsContent value="estoque" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Controle de Estoque</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                      placeholder="Buscar item..."
                      className="pl-10 pr-10 w-full md:w-80 h-11"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11">
                      <Filter className="mr-2 h-4 w-4 flex-shrink-0" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="scrollbar-hide-x">
              <div className="min-w-[600px] sm:min-w-[700px] md:min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold">Categoria</TableHead>
                    <TableHead className="font-semibold">Quantidade</TableHead>
                    <TableHead className="font-semibold">Estoque Mín.</TableHead>
                    <TableHead className="font-semibold">Unidade</TableHead>
                    <TableHead className="font-semibold">Fornecedor</TableHead>
                    <TableHead className="font-semibold">Preço Un.</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Movimentações</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.minQuantity);
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 border-b">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            item.quantity <= item.minQuantity * 0.5 ? 'text-destructive' :
                            item.quantity <= item.minQuantity ? 'text-warning' : 'text-success'
                          }`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.minQuantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell className="font-semibold">R$ {item.price.toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell>
                          <Badge className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-success/10 text-success hover:bg-success/20 hover:text-success border-success/20 h-8 text-xs justify-start w-full"
                                  onClick={() => handleOpenEntry(item)}
                                >
                                  <ArrowDownToLine className="h-3 w-3 mr-1.5" />
                                  Entrada
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Registrar entrada</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning border-warning/20 h-8 text-xs justify-start w-full"
                                  onClick={() => handleOpenExit(item)}
                                >
                                  <ArrowUpFromLine className="h-3 w-3 mr-1.5" />
                                  Saída
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Registrar saída</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-700 border-purple-500/20 h-8 text-xs justify-start w-full"
                                  onClick={() => handleOpenMovements(item)}
                                >
                                  <History className="h-3 w-3 mr-1.5 text-purple-600" />
                                  Histórico
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver movimentações</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar item</p>
                              </TooltipContent>
                            </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    onClick={() => {
                                      setItemToDelete(item);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir item</p>
                                </TooltipContent>
                              </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        </TabsContent>

        {/* Tab: Movimentações */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Registro completo de todas as entradas e saídas do estoque
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[1000px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Quantidade</TableHead>
                    <TableHead className="font-semibold">Fornecedor</TableHead>
                    <TableHead className="font-semibold">Valor</TableHead>
                    <TableHead className="font-semibold">Usuário</TableHead>
                    <TableHead className="font-semibold">Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id} className="hover:bg-muted/30 border-b">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movement.itemName}</TableCell>
                      <TableCell>
                        <Badge className={movement.type === "entrada" 
                          ? "bg-success/10 text-success hover:bg-success/20" 
                          : "bg-warning/10 text-warning hover:bg-warning/20"}>
                          {movement.type === "entrada" ? (
                            <ArrowDownToLine className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowUpFromLine className="mr-1 h-3 w-3" />
                          )}
                          {movement.type === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{movement.quantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.supplier || "-"}
                      </TableCell>
                      <TableCell>
                        {movement.totalPrice ? (
                          <div>
                            <p className="font-semibold text-sm">R$ {movement.totalPrice.toFixed(2).replace('.', ',')}</p>
                            {movement.unitPrice && (
                              <p className="text-xs text-muted-foreground">
                                R$ {movement.unitPrice.toFixed(2).replace('.', ',')} / un
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={movement.reason || ""}>
                        {movement.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Consumo por Item (Últimos 30 dias)
                </CardTitle>
                <CardDescription>
                  Itens mais consumidos no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consumptionReport.length > 0 ? (
                    consumptionReport.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <ArrowDownToLine className="h-3 w-3 text-success" />
                              <span className="text-xs text-muted-foreground">Entrada: {item.entrada}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ArrowUpFromLine className="h-3 w-3 text-warning" />
                              <span className="text-xs text-muted-foreground">Saída: {item.saida}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${item.saldo >= 0 ? 'text-success' : 'text-warning'}`}>
                            {item.saldo >= 0 ? '+' : ''}{item.saldo}
                          </p>
                          <p className="text-xs text-muted-foreground">Saldo</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma movimentação nos últimos 30 dias</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-info">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-info" />
                  Itens por Categoria
                </CardTitle>
                <CardDescription>
                  Distribuição de itens por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryItems = inventory.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                        <div>
                          <p className="font-semibold text-sm">{category}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-info">R$ {categoryValue.toFixed(2).replace('.', ',')}</p>
                          <p className="text-xs text-muted-foreground">Valor total</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-l-4 border-l-success">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                Itens com Maior Rotatividade
              </CardTitle>
              <CardDescription>
                Itens com maior número de movimentações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consumptionReport.slice(0, 5).map((item, idx) => {
                  const itemData = inventory.find(i => i.name === item.name);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                          <span className="text-lg font-bold text-success">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {itemData?.category} • Estoque atual: {itemData?.quantity} {itemData?.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">{item.saida}</p>
                        <p className="text-xs text-muted-foreground">Saídas (30 dias)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Entrada */}
      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-success" />
              Registrar Entrada de Estoque
            </DialogTitle>
            <DialogDescription>
              Registre a entrada de {selectedItem?.name} no estoque
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Informações do Item */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Item</p>
                      <p className="font-semibold text-base">{selectedItem?.name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{selectedItem?.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Estoque Atual</p>
                      <p className="font-semibold text-sm">{selectedItem?.quantity} {selectedItem?.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estoque Mínimo</p>
                      <p className="font-semibold text-sm text-warning">{selectedItem?.minQuantity} {selectedItem?.unit}</p>
                    </div>
                  </div>
                  {movementQuantity && parseFloat(movementQuantity) > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Novo Estoque</p>
                      <p className="font-bold text-lg text-success">
                        {(selectedItem?.quantity || 0) + parseFloat(movementQuantity)} {selectedItem?.unit}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-2">
                <Label htmlFor="entryDate">Data da Entrada *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="entryQuantity">Quantidade *</Label>
                <Input
                  id="entryQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Unidade: {selectedItem?.unit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entrySupplier">Fornecedor</Label>
                <Input
                  id="entrySupplier"
                  placeholder="Nome do fornecedor"
                  value={movementSupplier}
                  onChange={(e) => setMovementSupplier(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entryUnitPrice">Preço Unitário (R$)</Label>
                <Input
                  id="entryUnitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={movementUnitPrice}
                  onChange={(e) => setMovementUnitPrice(e.target.value)}
                />
                {movementQuantity && movementUnitPrice && parseFloat(movementQuantity) > 0 && parseFloat(movementUnitPrice) > 0 && (
                  <p className="text-xs font-semibold text-success">
                    Total: R$ {(parseFloat(movementQuantity) * parseFloat(movementUnitPrice)).toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entryUser">Usuário *</Label>
              <Select value={movementUser} onValueChange={setMovementUser} required>
                <SelectTrigger id="entryUser">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entryReason">Observações / Motivo *</Label>
              <Textarea
                id="entryReason"
                placeholder="Ex: Compra regular, Doação, Reposição de estoque..."
                rows={3}
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="resize-none"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEntryDialogOpen(false);
              setSelectedItem(null);
              setMovementQuantity("");
              setMovementReason("");
              setMovementUser("Dr. João Santos");
              setMovementDate(new Date().toISOString().split('T')[0]);
              setMovementSupplier("");
              setMovementUnitPrice("");
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEntry} 
              className="bg-success hover:bg-success/90"
              disabled={!movementUser?.trim() || !movementReason?.trim()}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Registrar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Saída */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-warning" />
              Registrar Saída de Estoque
            </DialogTitle>
            <DialogDescription>
              Registre a saída de {selectedItem?.name} do estoque
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Informações do Item */}
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Item</p>
                      <p className="font-semibold text-base">{selectedItem?.name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{selectedItem?.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Estoque Atual</p>
                      <p className="font-semibold text-sm">{selectedItem?.quantity} {selectedItem?.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estoque Mínimo</p>
                      <p className="font-semibold text-sm text-warning">{selectedItem?.minQuantity} {selectedItem?.unit}</p>
                    </div>
                  </div>
                  {movementQuantity && parseFloat(movementQuantity) > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Novo Estoque</p>
                      <p className={`font-bold text-lg ${
                        (selectedItem?.quantity || 0) - parseFloat(movementQuantity) <= (selectedItem?.minQuantity || 0) * 0.5
                          ? 'text-destructive'
                          : (selectedItem?.quantity || 0) - parseFloat(movementQuantity) <= (selectedItem?.minQuantity || 0)
                          ? 'text-warning'
                          : 'text-success'
                      }`}>
                        {(selectedItem?.quantity || 0) - parseFloat(movementQuantity)} {selectedItem?.unit}
                      </p>
                      {(selectedItem?.quantity || 0) - parseFloat(movementQuantity) <= (selectedItem?.minQuantity || 0) && (
                        <p className="text-xs text-warning mt-1">
                          ⚠️ Estoque ficará abaixo do mínimo após esta saída
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-2">
                <Label htmlFor="exitDate">Data da Saída *</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="exitQuantity">Quantidade *</Label>
                <Input
                  id="exitQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selectedItem?.quantity}
                  placeholder="0"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Unidade: {selectedItem?.unit}</p>
                {movementQuantity && parseFloat(movementQuantity) > (selectedItem?.quantity || 0) && (
                  <p className="text-xs text-destructive font-semibold">
                    ⚠️ Quantidade maior que o estoque disponível
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exitUser">Usuário *</Label>
              <Select value={movementUser} onValueChange={setMovementUser} required>
                <SelectTrigger id="exitUser">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exitReason">Observações / Motivo *</Label>
              <Textarea
                id="exitReason"
                placeholder="Ex: Uso em consultas, Procedimentos, Venda, Descarte..."
                rows={3}
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="resize-none"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setExitDialogOpen(false);
              setSelectedItem(null);
              setMovementQuantity("");
              setMovementReason("");
              setMovementUser("Dr. João Santos");
              setMovementDate(new Date().toISOString().split('T')[0]);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExit} 
              className="bg-warning hover:bg-warning/90"
              disabled={
                (movementQuantity && parseFloat(movementQuantity) > (selectedItem?.quantity || 0)) ||
                !movementUser?.trim() ||
                !movementReason?.trim()
              }
            >
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Registrar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Movimentações */}
      <Dialog open={movementsDialogOpen} onOpenChange={setMovementsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Histórico de Movimentações - {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              Todas as entradas e saídas deste item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {itemMovements.length > 0 ? (
              itemMovements.map((movement) => (
                <Card key={movement.id} className={`border-l-4 ${
                  movement.type === "entrada" ? "border-l-success" : "border-l-warning"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          movement.type === "entrada" ? "bg-success/10" : "bg-warning/10"
                        }`}>
                          {movement.type === "entrada" ? (
                            <ArrowDownToLine className={`h-5 w-5 ${movement.type === "entrada" ? "text-success" : "text-warning"}`} />
                          ) : (
                            <ArrowUpFromLine className={`h-5 w-5 ${movement.type === "entrada" ? "text-success" : "text-warning"}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-sm">
                              {movement.type === "entrada" ? "Entrada" : "Saída"} de {movement.quantity} {selectedItem?.unit}
                            </p>
                            <Badge className={movement.type === "entrada" 
                              ? "bg-success/10 text-success hover:bg-success/20" 
                              : "bg-warning/10 text-warning hover:bg-warning/20"}>
                              {movement.type === "entrada" ? "Entrada" : "Saída"}
                            </Badge>
                          </div>
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {new Date(movement.date).toLocaleDateString('pt-BR')} • {movement.user}
                              </p>
                            </div>
                            {movement.supplier && (
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  Fornecedor: {movement.supplier}
                                </p>
                              </div>
                            )}
                            {movement.totalPrice && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3 text-success" />
                                <p className="text-xs font-semibold text-success">
                                  Total: R$ {movement.totalPrice.toFixed(2).replace('.', ',')}
                                  {movement.unitPrice && (
                                    <span className="text-muted-foreground font-normal ml-1">
                                      (R$ {movement.unitPrice.toFixed(2).replace('.', ',')} / un)
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            {movement.reason && (
                              <div className="mt-1 pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold">Observação:</span> {movement.reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação registrada para este item</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setMovementsDialogOpen(false);
              setSelectedItem(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Edite as informações do item {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Nome do Item</Label>
              <Input id="editName" defaultValue={editingItem?.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editCategory">Categoria</Label>
                <Select defaultValue={editingItem?.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editUnit">Unidade</Label>
                <Select defaultValue={editingItem?.unit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editQuantity">Quantidade</Label>
                <Input id="editQuantity" type="number" defaultValue={editingItem?.quantity} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editMinQuantity">Estoque Mínimo</Label>
                <Input id="editMinQuantity" type="number" defaultValue={editingItem?.minQuantity} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editSupplier">Fornecedor</Label>
              <Input id="editSupplier" defaultValue={editingItem?.supplier} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPrice">Preço Unitário (R$)</Label>
              <Input id="editPrice" type="number" step="0.01" defaultValue={editingItem?.price} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success("Item atualizado com sucesso!");
              setEditDialogOpen(false);
              setEditingItem(null);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item <strong>{itemToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};

export default Estoque;
