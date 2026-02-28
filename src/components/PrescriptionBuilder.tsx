import { useState, useEffect, useRef } from 'react';
import { medicationService, Medication } from '@/lib/medicationService';
import { prescriptionService, PrescriptionMedication } from '@/lib/prescriptionService';
import { MedicationSearch } from './MedicationSearch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, X, Trash2, Info, Printer, Download, QrCode, FileSignature } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

interface PrescriptionBuilderProps {
  patientId: number;
  patientName: string;
  patientCpf: string;
  patientAllergies: string[];
  patientConditions: string[];
  doctorName: string;
  doctorCrm: string;
  doctorCrmState: string;
  onSave?: (prescription: any) => void;
}

export const PrescriptionBuilder = ({
  patientId,
  patientName,
  patientCpf,
  patientAllergies,
  patientConditions,
  doctorName,
  doctorCrm,
  doctorCrmState,
  onSave
}: PrescriptionBuilderProps) => {
  const [medications, setMedications] = useState<Array<PrescriptionMedication & { medication: Medication }>>([]);
  const [interactions, setInteractions] = useState<Array<{
    med1: string;
    med2: string;
    severity: 'high' | 'medium' | 'low';
    description?: string;
  }>>([]);
  const [contraindications, setContraindications] = useState<Array<{
    medication: string;
    reasons: string[];
  }>>([]);
  const [savedPrescription, setSavedPrescription] = useState<any>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    // Verificar interações quando medicamentos mudarem
    const medIds = medications.map(m => m.medicationId);
    const foundInteractions = medicationService.checkInteractions(medIds);
    setInteractions(foundInteractions);

    // Verificar contraindicações
    const allContraindications: Array<{ medication: string; reasons: string[] }> = [];
    medications.forEach(med => {
      const contra = medicationService.checkContraindications(
        med.medicationId,
        patientAllergies,
        patientConditions
      );
      if (contra.length > 0) {
        allContraindications.push({
          medication: med.medicationName,
          reasons: contra
        });
      }
    });
    setContraindications(allContraindications);
  }, [medications, patientAllergies, patientConditions]);

  const handleAddMedication = (medication: Medication) => {
    setMedications([...medications, {
      medicationId: medication.id,
      medicationName: medication.name,
      medication: medication,
      dosage: medication.dosage,
      frequency: '1x ao dia',
      duration: '7 dias',
      quantity: 1,
      instructions: `Tomar ${medication.dosage} ${medication.unit}`
    }]);
    toast.success(`${medication.name} adicionado à prescrição`);
  };

  const handleRemoveMedication = (index: number) => {
    const removed = medications[index];
    setMedications(medications.filter((_, i) => i !== index));
    toast.info(`${removed.medicationName} removido da prescrição`);
  };

  const handleUpdateMedication = (index: number, field: keyof PrescriptionMedication, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSavePrescription = () => {
    if (medications.length === 0) {
      toast.error("Adicione pelo menos um medicamento à prescrição");
      return;
    }

    const prescriptionData = {
      patientId,
      patientName,
      patientCpf,
      doctorName,
      doctorCrm,
      doctorCrmState,
      date: new Date().toISOString().split('T')[0],
      medications: medications.map(m => ({
        medicationId: m.medicationId,
        medicationName: m.medicationName,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        quantity: m.quantity,
        instructions: m.instructions
      }))
    };

    const prescription = prescriptionService.createPrescription(prescriptionData);
    setSavedPrescription(prescription);
    
    if (onSave) {
      onSave(prescription);
    }
    
    toast.success("Prescrição criada com sucesso!");
  };

  // Funções de assinatura digital
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if ('touches' in e) e.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ('touches' in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hasSignature = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 255 || g < 255 || b < 255) return true;
    }
    return false;
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasSignature()) {
      toast.error("Por favor, desenhe sua assinatura antes de confirmar.");
      return;
    }
    const dataURL = canvas.toDataURL('image/png');
    setSignature(dataURL);
    if (savedPrescription) {
      const signed = prescriptionService.signPrescription(savedPrescription.id, dataURL);
      if (signed) {
        setSavedPrescription({ ...signed, signature: dataURL });
        toast.success("Prescrição assinada com sucesso!");
      }
    }
    setSignatureDialogOpen(false);
  };

  useEffect(() => {
    if (signatureDialogOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [signatureDialogOpen]);

  const handlePrintPrescription = () => {
    if (!savedPrescription) {
      toast.error("Salve a prescrição antes de imprimir");
      return;
    }

    const printContent = generatePrescriptionHTML(savedPrescription);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  const handleDownloadPDF = () => {
    if (!savedPrescription) {
      toast.error("Salve a prescrição antes de baixar o PDF");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      addText('RECEITA MÉDICA DIGITAL', 18, true, [21, 128, 61]);
      yPosition += 5;
      doc.setDrawColor(21, 128, 61);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      addText(`Data: ${new Date(savedPrescription.date).toLocaleDateString('pt-BR')}`, 10, false);
      addText(`Paciente: ${savedPrescription.patientName}`, 11, true);
      addText(`CPF: ${savedPrescription.patientCpf}`, 10, false);
      yPosition += 5;

      addText('MEDICAMENTOS PRESCRITOS:', 12, true);
      yPosition += 5;
      
      savedPrescription.medications.forEach((med: PrescriptionMedication, idx: number) => {
        addText(`${idx + 1}. ${med.medicationName}`, 11, true);
        addText(`   Dosagem: ${med.dosage}`, 10, false);
        addText(`   Frequência: ${med.frequency}`, 10, false);
        addText(`   Duração: ${med.duration}`, 10, false);
        addText(`   Quantidade: ${med.quantity} unidades`, 10, false);
        if (med.instructions) {
          addText(`   Instruções: ${med.instructions}`, 10, false);
        }
        yPosition += 3;
      });

      yPosition += 10;
      addText('MÉDICO RESPONSÁVEL:', 12, true);
      addText(`${savedPrescription.doctorName}`, 11, false);
      addText(`CRM: ${savedPrescription.doctorCrm} - ${savedPrescription.doctorCrmState}`, 10, false);
      yPosition += 10;

      if (savedPrescription.qrCode) {
        addText('Código de Validação:', 10, true);
        addText(savedPrescription.qrCode, 9, false);
      }

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerText = `Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude`;
      doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

      const fileName = `prescricao_${savedPrescription.id}_${savedPrescription.date.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const generatePrescriptionHTML = (prescription: any): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receita Médica - ${prescription.patientName}</title>
  <style>
    @media print {
      @page {
        margin: 2cm 1.5cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .patient-info {
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .patient-info p {
      margin: 5px 0;
      font-size: 11pt;
    }
    .medications {
      margin: 30px 0;
      line-height: 1.8;
    }
    .medication-item {
      margin-bottom: 20px;
      padding: 10px;
      border-left: 3px solid #15803d;
      background-color: #f9fafb;
    }
    .medication-item h3 {
      margin: 0 0 10px 0;
      font-size: 12pt;
      font-weight: bold;
    }
    .medication-item p {
      margin: 3px 0;
      font-size: 10pt;
    }
    .signature-section {
      margin-top: 60px;
      text-align: right;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin: 50px 0 5px auto;
      padding-top: 5px;
    }
    .doctor-info {
      text-align: right;
      font-size: 10pt;
      margin-top: 10px;
    }
    .qr-code {
      margin-top: 30px;
      text-align: center;
    }
    .date-location {
      text-align: right;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .signature-image {
      max-width: 200px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Receita Médica Digital</h1>
  </div>

  <div class="date-location">
    <p>${new Date(prescription.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${prescription.patientName}</p>
    <p><strong>CPF:</strong> ${prescription.patientCpf}</p>
  </div>

  <div class="medications">
    ${prescription.medications.map((med: PrescriptionMedication, idx: number) => `
      <div class="medication-item">
        <h3>${idx + 1}. ${med.medicationName}</h3>
        <p><strong>Dosagem:</strong> ${med.dosage}</p>
        <p><strong>Frequência:</strong> ${med.frequency}</p>
        <p><strong>Duração:</strong> ${med.duration}</p>
        <p><strong>Quantidade:</strong> ${med.quantity} unidades</p>
        ${med.instructions ? `<p><strong>Instruções:</strong> ${med.instructions}</p>` : ''}
      </div>
    `).join('')}
  </div>

  ${prescription.signature ? `
  <div class="signature-section">
    <img src="${prescription.signature}" alt="Assinatura" class="signature-image" />
    <div class="doctor-info">
      <p><strong>${prescription.doctorName}</strong></p>
      <p>CRM: ${prescription.doctorCrm} - ${prescription.doctorCrmState}</p>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="doctor-info">
      <p><strong>${prescription.doctorName}</strong></p>
      <p>CRM: ${prescription.doctorCrm} - ${prescription.doctorCrmState}</p>
    </div>
  </div>
  `}

  ${prescription.qrCode ? `
  <div class="qr-code">
    <p><strong>Código de Validação:</strong></p>
    <p style="font-family: monospace; font-size: 10pt;">${prescription.qrCode}</p>
  </div>
  ` : ''}

  <div style="margin-top: 40px; font-size: 9pt; text-align: center; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude</p>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-4">
      {/* Busca de medicamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Adicionar Medicamento</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicationSearch 
            onSelect={handleAddMedication}
            selectedMedications={medications.map(m => m.medicationId)}
          />
        </CardContent>
      </Card>

      {/* Alertas de interações */}
      {interactions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Interações Medicamentosas Detectadas</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              {interactions.map((inter, idx) => (
                <li key={idx}>
                  <strong>{inter.med1}</strong> + <strong>{inter.med2}</strong>
                  {inter.description && ` - ${inter.description}`}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Alertas de contraindicações */}
      {contraindications.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Contraindicações Detectadas</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4 mt-2 space-y-2">
              {contraindications.map((contra, idx) => (
                <li key={idx}>
                  <strong>{contra.medication}:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {contra.reasons.map((reason, reasonIdx) => (
                      <li key={reasonIdx}>{reason}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de medicamentos prescritos */}
      {medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Medicamentos Prescritos ({medications.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.map((med, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{med.medicationName}</h4>
                        <Badge variant={med.medication.controlled ? 'destructive' : 'secondary'}>
                          {med.medication.controlled ? 'Controlado' : med.medication.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {med.medication.activePrinciple} - {med.medication.presentation}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(idx)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`dosage-${idx}`}>Dosagem</Label>
                      <Input
                        id={`dosage-${idx}`}
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedication(idx, 'dosage', e.target.value)}
                        placeholder="Ex: 50mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`frequency-${idx}`}>Frequência</Label>
                      <Input
                        id={`frequency-${idx}`}
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedication(idx, 'frequency', e.target.value)}
                        placeholder="Ex: 1x ao dia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`duration-${idx}`}>Duração</Label>
                      <Input
                        id={`duration-${idx}`}
                        value={med.duration}
                        onChange={(e) => handleUpdateMedication(idx, 'duration', e.target.value)}
                        placeholder="Ex: 30 dias"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${idx}`}>Quantidade</Label>
                      <Input
                        id={`quantity-${idx}`}
                        type="number"
                        value={med.quantity}
                        onChange={(e) => handleUpdateMedication(idx, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Ex: 30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor={`instructions-${idx}`}>Instruções</Label>
                    <Input
                      id={`instructions-${idx}`}
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedication(idx, 'instructions', e.target.value)}
                      placeholder="Ex: Tomar após as refeições"
                    />
                  </div>

                  {/* Informações do medicamento */}
                  {med.medication.sideEffects.length > 0 && (
                    <Alert className="mt-3">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Efeitos colaterais comuns:</strong> {med.medication.sideEffects.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Botões de ação */}
      {medications.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {savedPrescription && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePrintPrescription}
                  disabled={savedPrescription.status !== 'signed'}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                {savedPrescription.qrCode && (
                  <Button
                    variant="outline"
                    onClick={() => setQrDialogOpen(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Ver QR Code
                  </Button>
                )}
                {savedPrescription.status !== 'signed' && (
                  <Button
                    variant="outline"
                    onClick={() => setSignatureDialogOpen(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Assinar
                  </Button>
                )}
              </>
            )}
          </div>
          <Button 
            onClick={handleSavePrescription} 
            className="bg-primary hover:bg-primary/90"
          >
            {savedPrescription ? 'Atualizar Prescrição' : 'Salvar Prescrição'}
          </Button>
        </div>
      )}

      {/* Dialog de Assinatura Digital */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Assinatura Digital
            </DialogTitle>
            <DialogDescription>
              Desenhe sua assinatura no campo abaixo usando o mouse ou o dedo (em dispositivos touch)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width={700}
                height={200}
                className="w-full max-w-full border rounded cursor-crosshair touch-none"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearSignature}>
                Limpar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveSignature}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Confirmar Assinatura
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de QR Code */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Código QR da Prescrição
            </DialogTitle>
            <DialogDescription>
              Escaneie este código para validar a prescrição
            </DialogDescription>
          </DialogHeader>
          {savedPrescription?.qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-primary">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: savedPrescription.id,
                    patientCpf: savedPrescription.patientCpf,
                    date: savedPrescription.date,
                    doctorCrm: savedPrescription.doctorCrm,
                    code: savedPrescription.qrCode
                  })}
                  size={200}
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">Código de Validação</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">{savedPrescription.qrCode}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

