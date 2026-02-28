// Serviço de gerenciamento de medicamentos

export interface Medication {
  id: string;
  name: string;
  activePrinciple: string;
  presentation: string;
  manufacturer: string;
  anvisaCode: string;
  controlled: boolean; // medicamento controlado
  requiresPrescription: boolean;
  dosage: string;
  unit: string; // comprimido, ml, etc.
  interactions: string[]; // IDs de medicamentos que interagem
  contraindications: string[];
  sideEffects: string[];
  category: string; // antibiótico, analgésico, etc.
}

// Base de dados inicial de medicamentos brasileiros comuns
const medicationDatabase: Medication[] = [
  {
    id: 'med-001',
    name: 'Losartana Potássica',
    activePrinciple: 'Losartana',
    presentation: '50mg',
    manufacturer: 'EMS',
    anvisaCode: '1010701230019',
    controlled: false,
    requiresPrescription: true,
    dosage: '50mg',
    unit: 'comprimido',
    interactions: ['med-002', 'med-003'],
    contraindications: ['Gravidez', 'Alergia ao componente', 'Estenose da artéria renal'],
    sideEffects: ['Tontura', 'Tosse seca', 'Hipotensão'],
    category: 'Anti-hipertensivo'
  },
  {
    id: 'med-002',
    name: 'Metformina',
    activePrinciple: 'Metformina',
    presentation: '500mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230020',
    controlled: false,
    requiresPrescription: true,
    dosage: '500mg',
    unit: 'comprimido',
    interactions: ['med-001'],
    contraindications: ['Insuficiência renal', 'Acidose láctica', 'Gravidez'],
    sideEffects: ['Náusea', 'Diarréia', 'Sabor metálico'],
    category: 'Antidiabético'
  },
  {
    id: 'med-003',
    name: 'Atenolol',
    activePrinciple: 'Atenolol',
    presentation: '25mg',
    manufacturer: 'Medley',
    anvisaCode: '1010701230021',
    controlled: false,
    requiresPrescription: true,
    dosage: '25mg',
    unit: 'comprimido',
    interactions: ['med-001'],
    contraindications: ['Asma', 'Bloqueio cardíaco', 'Insuficiência cardíaca'],
    sideEffects: ['Fadiga', 'Bradicardia', 'Hipotensão'],
    category: 'Beta-bloqueador'
  },
  {
    id: 'med-004',
    name: 'Amoxicilina',
    activePrinciple: 'Amoxicilina',
    presentation: '500mg',
    manufacturer: 'Eurofarma',
    anvisaCode: '1010701230022',
    controlled: false,
    requiresPrescription: true,
    dosage: '500mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Alergia à penicilina', 'Mononucleose'],
    sideEffects: ['Náusea', 'Diarréia', 'Erupção cutânea'],
    category: 'Antibiótico'
  },
  {
    id: 'med-005',
    name: 'Dipirona Sódica',
    activePrinciple: 'Dipirona',
    presentation: '500mg',
    manufacturer: 'Sanofi',
    anvisaCode: '1010701230023',
    controlled: false,
    requiresPrescription: false,
    dosage: '500mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Gravidez', 'Alergia à dipirona'],
    sideEffects: ['Hipotensão', 'Agranulocitose'],
    category: 'Analgésico'
  },
  {
    id: 'med-006',
    name: 'Omeprazol',
    activePrinciple: 'Omeprazol',
    presentation: '20mg',
    manufacturer: 'Cimed',
    anvisaCode: '1010701230024',
    controlled: false,
    requiresPrescription: true,
    dosage: '20mg',
    unit: 'comprimido',
    interactions: ['med-004'],
    contraindications: ['Gravidez', 'Alergia ao componente'],
    sideEffects: ['Cefaleia', 'Diarréia', 'Náusea'],
    category: 'Protetor gástrico'
  },
  {
    id: 'med-007',
    name: 'Paracetamol',
    activePrinciple: 'Paracetamol',
    presentation: '750mg',
    manufacturer: 'Takeda',
    anvisaCode: '1010701230025',
    controlled: false,
    requiresPrescription: false,
    dosage: '750mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Insuficiência hepática', 'Alcoolismo'],
    sideEffects: ['Náusea', 'Hepatotoxicidade'],
    category: 'Analgésico'
  },
  {
    id: 'med-008',
    name: 'Ibuprofeno',
    activePrinciple: 'Ibuprofeno',
    presentation: '600mg',
    manufacturer: 'Eurofarma',
    anvisaCode: '1010701230026',
    controlled: false,
    requiresPrescription: false,
    dosage: '600mg',
    unit: 'comprimido',
    interactions: ['med-002'],
    contraindications: ['Úlcera péptica', 'Gravidez', 'Insuficiência renal'],
    sideEffects: ['Gastrite', 'Náusea', 'Tontura'],
    category: 'Anti-inflamatório'
  },
  {
    id: 'med-009',
    name: 'Sinvastatina',
    activePrinciple: 'Sinvastatina',
    presentation: '20mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230027',
    controlled: false,
    requiresPrescription: true,
    dosage: '20mg',
    unit: 'comprimido',
    interactions: ['med-008'],
    contraindications: ['Gravidez', 'Doença hepática ativa'],
    sideEffects: ['Mialgia', 'Elevação de enzimas hepáticas'],
    category: 'Hipolipemiante'
  },
  {
    id: 'med-010',
    name: 'Cloridrato de Sertralina',
    activePrinciple: 'Sertralina',
    presentation: '50mg',
    manufacturer: 'Pfizer',
    anvisaCode: '1010701230028',
    controlled: false,
    requiresPrescription: true,
    dosage: '50mg',
    unit: 'comprimido',
    interactions: ['med-001'],
    contraindications: ['Gravidez', 'Uso de IMAO'],
    sideEffects: ['Náusea', 'Insônia', 'Cefaleia'],
    category: 'Antidepressivo'
  },
  {
    id: 'med-011',
    name: 'Azitromicina',
    activePrinciple: 'Azitromicina',
    presentation: '500mg',
    manufacturer: 'Eurofarma',
    anvisaCode: '1010701230029',
    controlled: false,
    requiresPrescription: true,
    dosage: '500mg',
    unit: 'comprimido',
    interactions: ['med-006'],
    contraindications: ['Alergia à azitromicina', 'Insuficiência hepática'],
    sideEffects: ['Náusea', 'Diarréia', 'Dor abdominal'],
    category: 'Antibiótico'
  },
  {
    id: 'med-012',
    name: 'Dorflex',
    activePrinciple: 'Dipirona + Cafeína + Orfenadrina',
    presentation: '300mg + 35mg + 35mg',
    manufacturer: 'Sanofi',
    anvisaCode: '1010701230030',
    controlled: false,
    requiresPrescription: false,
    dosage: '1 comprimido',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Gravidez', 'Alergia à dipirona'],
    sideEffects: ['Sonolência', 'Tontura'],
    category: 'Analgésico'
  },
  {
    id: 'med-013',
    name: 'Pantoprazol',
    activePrinciple: 'Pantoprazol',
    presentation: '40mg',
    manufacturer: 'Takeda',
    anvisaCode: '1010701230031',
    controlled: false,
    requiresPrescription: true,
    dosage: '40mg',
    unit: 'comprimido',
    interactions: ['med-004'],
    contraindications: ['Gravidez', 'Alergia ao componente'],
    sideEffects: ['Cefaleia', 'Diarréia'],
    category: 'Protetor gástrico'
  },
  {
    id: 'med-014',
    name: 'Captopril',
    activePrinciple: 'Captopril',
    presentation: '25mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230032',
    controlled: false,
    requiresPrescription: true,
    dosage: '25mg',
    unit: 'comprimido',
    interactions: ['med-001', 'med-002'],
    contraindications: ['Gravidez', 'Estenose da artéria renal'],
    sideEffects: ['Tosse seca', 'Hipotensão', 'Tontura'],
    category: 'Anti-hipertensivo'
  },
  {
    id: 'med-015',
    name: 'Glibenclamida',
    activePrinciple: 'Glibenclamida',
    presentation: '5mg',
    manufacturer: 'Medley',
    anvisaCode: '1010701230033',
    controlled: false,
    requiresPrescription: true,
    dosage: '5mg',
    unit: 'comprimido',
    interactions: ['med-002'],
    contraindications: ['Gravidez', 'Insuficiência renal', 'Cetoacidose diabética'],
    sideEffects: ['Hipoglicemia', 'Náusea', 'Erupção cutânea'],
    category: 'Antidiabético'
  },
  {
    id: 'med-016',
    name: 'Hidroclorotiazida',
    activePrinciple: 'Hidroclorotiazida',
    presentation: '25mg',
    manufacturer: 'EMS',
    anvisaCode: '1010701230034',
    controlled: false,
    requiresPrescription: true,
    dosage: '25mg',
    unit: 'comprimido',
    interactions: ['med-001'],
    contraindications: ['Anúria', 'Insuficiência renal', 'Alergia à sulfonamida'],
    sideEffects: ['Hipotensão', 'Hipocalemia', 'Tontura'],
    category: 'Diurético'
  },
  {
    id: 'med-017',
    name: 'Loratadina',
    activePrinciple: 'Loratadina',
    presentation: '10mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230035',
    controlled: false,
    requiresPrescription: false,
    dosage: '10mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Gravidez', 'Alergia ao componente'],
    sideEffects: ['Sonolência', 'Boca seca'],
    category: 'Antialérgico'
  },
  {
    id: 'med-018',
    name: 'Diazepam',
    activePrinciple: 'Diazepam',
    presentation: '10mg',
    manufacturer: 'Cimed',
    anvisaCode: '1010701230036',
    controlled: true,
    requiresPrescription: true,
    dosage: '10mg',
    unit: 'comprimido',
    interactions: ['med-010'],
    contraindications: ['Gravidez', 'Miastenia gravis', 'Glaucoma'],
    sideEffects: ['Sonolência', 'Sedação', 'Dependência'],
    category: 'Ansiolítico'
  },
  {
    id: 'med-019',
    name: 'Fluoxetina',
    activePrinciple: 'Fluoxetina',
    presentation: '20mg',
    manufacturer: 'Eurofarma',
    anvisaCode: '1010701230037',
    controlled: false,
    requiresPrescription: true,
    dosage: '20mg',
    unit: 'comprimido',
    interactions: ['med-010'],
    contraindications: ['Gravidez', 'Uso de IMAO'],
    sideEffects: ['Náusea', 'Insônia', 'Ansiedade'],
    category: 'Antidepressivo'
  },
  {
    id: 'med-020',
    name: 'Ranitidina',
    activePrinciple: 'Ranitidina',
    presentation: '150mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230038',
    controlled: false,
    requiresPrescription: true,
    dosage: '150mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Gravidez', 'Alergia ao componente'],
    sideEffects: ['Cefaleia', 'Tontura'],
    category: 'Antiulceroso'
  },
  {
    id: 'med-021',
    name: 'Cefalexina',
    activePrinciple: 'Cefalexina',
    presentation: '500mg',
    manufacturer: 'Eurofarma',
    anvisaCode: '1010701230039',
    controlled: false,
    requiresPrescription: true,
    dosage: '500mg',
    unit: 'comprimido',
    interactions: [],
    contraindications: ['Alergia à penicilina', 'Insuficiência renal'],
    sideEffects: ['Náusea', 'Diarréia', 'Erupção cutânea'],
    category: 'Antibiótico'
  },
  {
    id: 'med-022',
    name: 'Nimesulida',
    activePrinciple: 'Nimesulida',
    presentation: '100mg',
    manufacturer: 'Medley',
    anvisaCode: '1010701230040',
    controlled: false,
    requiresPrescription: true,
    dosage: '100mg',
    unit: 'comprimido',
    interactions: ['med-002'],
    contraindications: ['Gravidez', 'Insuficiência hepática', 'Úlcera péptica'],
    sideEffects: ['Náusea', 'Gastrite', 'Hepatotoxicidade'],
    category: 'Anti-inflamatório'
  },
  {
    id: 'med-023',
    name: 'Cloridrato de Propranolol',
    activePrinciple: 'Propranolol',
    presentation: '40mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230041',
    controlled: false,
    requiresPrescription: true,
    dosage: '40mg',
    unit: 'comprimido',
    interactions: ['med-001', 'med-003'],
    contraindications: ['Asma', 'Bloqueio cardíaco', 'Insuficiência cardíaca'],
    sideEffects: ['Bradicardia', 'Hipotensão', 'Fadiga'],
    category: 'Beta-bloqueador'
  },
  {
    id: 'med-024',
    name: 'Sinvastatina',
    activePrinciple: 'Sinvastatina',
    presentation: '40mg',
    manufacturer: 'Germed',
    anvisaCode: '1010701230042',
    controlled: false,
    requiresPrescription: true,
    dosage: '40mg',
    unit: 'comprimido',
    interactions: ['med-008'],
    contraindications: ['Gravidez', 'Doença hepática ativa'],
    sideEffects: ['Mialgia', 'Elevação de enzimas hepáticas'],
    category: 'Hipolipemiante'
  },
  {
    id: 'med-025',
    name: 'Tramadol',
    activePrinciple: 'Tramadol',
    presentation: '50mg',
    manufacturer: 'Cimed',
    anvisaCode: '1010701230043',
    controlled: true,
    requiresPrescription: true,
    dosage: '50mg',
    unit: 'comprimido',
    interactions: ['med-010'],
    contraindications: ['Gravidez', 'Intoxicação alcoólica', 'Uso de IMAO'],
    sideEffects: ['Náusea', 'Tontura', 'Sonolência'],
    category: 'Analgésico'
  },
];

export const medicationService = {
  // Buscar medicamentos
  searchMedications: (query: string): Medication[] => {
    if (!query || query.trim().length < 2) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    return medicationDatabase.filter(med => 
      med.name.toLowerCase().includes(lowerQuery) ||
      med.activePrinciple.toLowerCase().includes(lowerQuery) ||
      med.anvisaCode.includes(query) ||
      med.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limitar resultados
  },

  // Obter medicamento por ID
  getMedicationById: (id: string): Medication | undefined => {
    return medicationDatabase.find(med => med.id === id);
  },

  // Obter todos os medicamentos
  getAllMedications: (): Medication[] => {
    return [...medicationDatabase];
  },

  // Verificar interações entre medicamentos
  checkInteractions: (medicationIds: string[]): Array<{
    med1: string;
    med2: string;
    severity: 'high' | 'medium' | 'low';
    description?: string;
  }> => {
    const interactions: Array<{
      med1: string;
      med2: string;
      severity: 'high' | 'medium' | 'low';
      description?: string;
    }> = [];
    
    for (let i = 0; i < medicationIds.length; i++) {
      const med1 = medicationService.getMedicationById(medicationIds[i]);
      if (!med1) continue;
      
      for (let j = i + 1; j < medicationIds.length; j++) {
        const med2 = medicationService.getMedicationById(medicationIds[j]);
        if (!med2) continue;
        
        // Verificar se há interação direta
        if (med1.interactions.includes(med2.id) || med2.interactions.includes(med1.id)) {
          interactions.push({
            med1: med1.name,
            med2: med2.name,
            severity: 'high',
            description: `Interação conhecida entre ${med1.name} e ${med2.name}`
          });
        }
        
        // Verificar interações por categoria
        if (med1.category === med2.category && med1.category !== 'Analgésico') {
          interactions.push({
            med1: med1.name,
            med2: med2.name,
            severity: 'medium',
            description: `Ambos são ${med1.category} - verificar necessidade de uso conjunto`
          });
        }
      }
    }
    
    return interactions;
  },

  // Verificar contraindicações
  checkContraindications: (
    medicationId: string, 
    patientAllergies: string[], 
    patientConditions: string[]
  ): string[] => {
    const medication = medicationService.getMedicationById(medicationId);
    if (!medication) return [];
    
    const contraindications: string[] = [];
    
    medication.contraindications.forEach(contra => {
      const lowerContra = contra.toLowerCase();
      
      // Verificar alergias
      patientAllergies.forEach(allergy => {
        if (allergy.toLowerCase().includes(lowerContra) || lowerContra.includes(allergy.toLowerCase())) {
          contraindications.push(`Alergia: ${contra}`);
        }
      });
      
      // Verificar condições do paciente
      patientConditions.forEach(condition => {
        if (condition.toLowerCase().includes(lowerContra) || lowerContra.includes(condition.toLowerCase())) {
          contraindications.push(`Condição: ${contra}`);
        }
      });
    });
    
    return contraindications;
  },

  // Obter informações completas do medicamento
  getMedicationInfo: (id: string): {
    medication: Medication | undefined;
    interactions: string[];
    contraindications: string[];
    sideEffects: string[];
  } => {
    const medication = medicationService.getMedicationById(id);
    if (!medication) {
      return {
        medication: undefined,
        interactions: [],
        contraindications: [],
        sideEffects: []
      };
    }

    return {
      medication,
      interactions: medication.interactions.map(id => {
        const med = medicationService.getMedicationById(id);
        return med ? med.name : id;
      }),
      contraindications: medication.contraindications,
      sideEffects: medication.sideEffects
    };
  }
};

