import { useState, useEffect } from 'react';
import { prescriptionService, Prescription } from '@/lib/prescriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  History,
  FileText,
  Printer,
  Download,
  QrCode,
  Calendar,
  User,
  Pill,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PrescriptionHistoryProps {
  patientCpf: string;
  patientName: string;
}

export const PrescriptionHistory = ({ patientCpf, patientName }: PrescriptionHistoryProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    loadPrescriptions();
    
    // Ouvir eventos de novas prescrições
    const handlePrescriptionCreated = () => {
      loadPrescriptions();
    };
    
    window.addEventListener('prescriptionCreated', handlePrescriptionCreated);
    window.addEventListener('prescriptionSigned', handlePrescriptionCreated);
    
    return () => {
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated);
      window.removeEventListener('prescriptionSigned', handlePrescriptionCreated);
    };
  }, [patientCpf]);

  const loadPrescriptions = () => {
    const patientPrescriptions = prescriptionService.getPatientPrescriptions(patientCpf);
    setPrescriptions(patientPrescriptions);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    const printContent = generatePrescriptionHTML(prescription);
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

  const handleDownloadPDF = (prescription: Prescription) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar texto
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

      // Cabeçalho
      addText('RECEITA MÉDICA DIGITAL', 18, true, [21, 128, 61]);
      yPosition += 5;

      // Linha divisória
      doc.setDrawColor(21, 128, 61);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Data
      addText(`Data: ${new Date(prescription.date).toLocaleDateString('pt-BR')}`, 10, false);
      
      // Informações do paciente
      addText(`Paciente: ${prescription.patientName}`, 11, true);
      addText(`CPF: ${prescription.patientCpf}`, 10, false);
      yPosition += 5;

      // Medicamentos
      addText('MEDICAMENTOS PRESCRITOS:', 12, true);
      yPosition += 5;
      
      prescription.medications.forEach((med, idx) => {
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

      // Informações do médico
      addText('MÉDICO RESPONSÁVEL:', 12, true);
      addText(`${prescription.doctorName}`, 11, false);
      addText(`CRM: ${prescription.doctorCrm} - ${prescription.doctorCrmState}`, 10, false);
      yPosition += 10;

      // QR Code (se disponível)
      if (prescription.qrCode) {
        addText('Código de Validação:', 10, true);
        addText(prescription.qrCode, 9, false);
      }

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerText = `Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude`;
      doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // Salvar PDF
      const fileName = `prescricao_${prescription.id}_${prescription.date.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const generatePrescriptionHTML = (prescription: Prescription): string => {
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
    .qr-code img {
      width: 150px;
      height: 150px;
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
    .status-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: bold;
      margin-left: 10px;
    }
    .status-signed {
      background-color: #dcfce7;
      color: #166534;
    }
    .status-draft {
      background-color: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Receita Médica Digital</h1>
    <span class="status-badge ${prescription.status === 'signed' ? 'status-signed' : 'status-draft'}">
      ${prescription.status === 'signed' ? 'ASSINADA' : 'RASCUNHO'}
    </span>
  </div>

  <div class="date-location">
    <p>${new Date(prescription.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${prescription.patientName}</p>
    <p><strong>CPF:</strong> ${prescription.patientCpf}</p>
  </div>

  <div class="medications">
    ${prescription.medications.map((med, idx) => `
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

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma prescrição encontrada para este paciente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Prescrições ({prescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">
                            {new Date(prescription.date).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge 
                            variant={prescription.status === 'signed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {prescription.status === 'signed' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Assinada
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Rascunho
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-muted-foreground">
                            <User className="h-3 w-3 inline mr-1" />
                            {prescription.doctorName} - CRM: {prescription.doctorCrm}/{prescription.doctorCrmState}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Pill className="h-3 w-3 inline mr-1" />
                            {prescription.medications.length} medicamento(s)
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prescription.medications.slice(0, 3).map((med, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {med.medicationName}
                            </Badge>
                          ))}
                          {prescription.medications.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{prescription.medications.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPrescription(prescription)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintPrescription(prescription)}
                          disabled={prescription.status !== 'signed'}
                          className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Imprimir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(prescription)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {prescription.qrCode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setQrDialogOpen(true);
                            }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            QR
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Prescrição - {selectedPrescription?.date}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos da prescrição médica
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="font-semibold">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="font-semibold">{selectedPrescription.patientCpf}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Médico</p>
                  <p className="font-semibold">
                    {selectedPrescription.doctorName} - CRM: {selectedPrescription.doctorCrm}/{selectedPrescription.doctorCrmState}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedPrescription.status === 'signed' ? 'default' : 'secondary'}>
                    {selectedPrescription.status === 'signed' ? 'Assinada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-3">Medicamentos Prescritos</p>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med, idx) => (
                    <Card key={idx} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">{idx + 1}. {med.medicationName}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dosagem:</span> {med.dosage}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Frequência:</span> {med.frequency}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duração:</span> {med.duration}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantidade:</span> {med.quantity} unidades
                          </div>
                          {med.instructions && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Instruções:</span> {med.instructions}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedPrescription.signature && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold mb-2">Assinatura Digital</p>
                    <img src={selectedPrescription.signature} alt="Assinatura" className="max-w-xs border rounded" />
                  </div>
                </>
              )}

              {selectedPrescription.qrCode && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold mb-2">Código de Validação</p>
                    <p className="font-mono text-sm bg-muted p-2 rounded">{selectedPrescription.qrCode}</p>
                  </div>
                </>
              )}
            </div>
          )}
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
          {selectedPrescription?.qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-primary">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: selectedPrescription.id,
                    patientCpf: selectedPrescription.patientCpf,
                    date: selectedPrescription.date,
                    doctorCrm: selectedPrescription.doctorCrm,
                    code: selectedPrescription.qrCode
                  })}
                  size={200}
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">Código de Validação</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">{selectedPrescription.qrCode}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

