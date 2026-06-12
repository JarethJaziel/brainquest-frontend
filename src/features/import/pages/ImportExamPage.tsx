import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ImportedExamRepository } from '../../../data/repositories/ImportedExamRepository';
import { validateExamJson } from '../../../services/ExamJsonValidator';
import type { ValidationReport } from '../../../services/ExamJsonValidator';
import type { Exam } from '../../../models/exam';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const ImportExamPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [parsedExam, setParsedExam] = useState<Exam | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [importedId, setImportedId] = useState('');

  const importedRepo = new ImportedExamRepository();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFileContent = (content: string, name: string) => {
    setFileName(name);
    try {
      const json = JSON.parse(content);
      const report = validateExamJson(json);
      setValidationReport(report);
      
      if (report.isValid) {
        setParsedExam(json as Exam);
      } else {
        setParsedExam(null);
      }
      setStep(2);
    } catch (e) {
      setValidationReport({
        isValid: false,
        errors: [{ path: 'JSON', message: 'El archivo no contiene un formato JSON válido.', severity: 'error' }],
        warnings: [],
      });
      setParsedExam(null);
      setStep(2);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            processFileContent(event.target.result as string, file.name);
          }
        };
        reader.readAsText(file);
      } else {
        alert('Por favor, sube únicamente archivos en formato JSON.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processFileContent(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImport = () => {
    if (!parsedExam) return;

    try {
      const savedId = importedRepo.save(parsedExam, fileName);
      setImportedId(savedId);
      
      // Fire success confetti
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });

      setStep(3);
    } catch (err) {
      console.error('Error saving exam', err);
      alert('Error al guardar el examen en la base de datos local.');
    }
  };

  const handleReset = () => {
    setFileName('');
    setParsedExam(null);
    setValidationReport(null);
    setImportedId('');
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    expert: 'Experto',
  };

  const subjectIcons: Record<string, string> = {
    'matemáticas': 'calculate',
    'ciencias': 'pets',
    'lectura': 'auto_stories',
    'geografía': 'public',
    'historia': 'history',
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 select-none pb-12 text-left">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
          <MaterialIcon name="file_upload" className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface">Cargar Nueva Aventura</h1>
          <p className="text-outline font-bold text-sm">Importa un examen en formato JSON para jugarlo al instante</p>
        </div>
      </div>

      {/* STEP 1: DROPZONE */}
      {step === 1 && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`
            clay-card p-10 border-4 border-dashed rounded-3xl cursor-pointer text-center flex flex-col items-center justify-center gap-4 min-h-[300px] transition-all select-none
            ${dragActive 
              ? 'dropzone-active scale-[0.99] duration-150' 
              : 'border-outline-variant hover:border-primary hover:bg-primary/5 shadow-md active:scale-95 duration-200'
            }
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          
          <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-inner animate-pulse-slow">
            <MaterialIcon name="cloud_upload" className="text-4xl font-black" />
          </div>

          <div>
            <h3 className="text-lg font-black text-on-surface mb-1">Arrastra tu archivo JSON aquí</h3>
            <p className="text-outline font-bold text-sm">o haz clic para explorar tus carpetas</p>
          </div>

          <div className="mt-2 text-xs font-bold text-outline bg-surface-container px-3 py-1.5 rounded-full border border-solid border-outline-variant/30">
            Formato: .json (máx. 2MB)
          </div>
        </div>
      )}

      {/* STEP 2: VALIDATION & PREVIEW */}
      {step === 2 && validationReport && (
        <div className="flex flex-col gap-6">
          {/* Status Header */}
          {validationReport.isValid ? (
            <div className="bg-emerald-50 border-2 border-solid border-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
              <MaterialIcon name="check_circle" className="text-3xl text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-black text-base">¡Formato correcto!</h4>
                <p className="text-xs font-semibold text-emerald-700">El examen cumple con todas las reglas y está listo para importar.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-solid border-red-300 p-4 rounded-2xl flex items-center gap-3 text-error">
              <MaterialIcon name="error" className="text-3xl text-error shrink-0" />
              <div>
                <h4 className="font-black text-base">Errores en el archivo</h4>
                <p className="text-xs font-semibold text-error/90">Corrige los siguientes problemas para poder importar este examen.</p>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validationReport.warnings.length > 0 && (
            <div className="bg-amber-50 border-2 border-solid border-amber-300 p-4 rounded-2xl flex flex-col gap-2 text-amber-900">
              <div className="flex items-center gap-2 font-black text-sm text-amber-800">
                <MaterialIcon name="warning" className="text-amber-600 text-lg shrink-0" />
                <span>Advertencias ({validationReport.warnings.length})</span>
              </div>
              <ul className="list-disc pl-5 text-xs font-semibold text-amber-700 flex flex-col gap-1">
                {validationReport.warnings.map((warn, i) => (
                  <li key={i}>
                    <span className="font-black font-mono">[{warn.path}]:</span> {warn.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Errors list */}
          {!validationReport.isValid && (
            <ClayCard className="p-5 flex flex-col gap-3 max-h-[300px] overflow-y-auto border-2 border-solid border-red-200">
              <h3 className="font-black text-sm text-error uppercase tracking-wider">Lista de Errores ({validationReport.errors.length})</h3>
              <div className="flex flex-col gap-2.5">
                {validationReport.errors.map((err, i) => (
                  <div key={i} className="text-xs bg-red-50/50 p-2.5 rounded-xl border border-solid border-red-100 font-semibold text-red-700">
                    <span className="font-black font-mono block text-red-900 text-[10px] mb-0.5">RUTA: {err.path}</span>
                    {err.message}
                  </div>
                ))}
              </div>
            </ClayCard>
          )}

          {/* VALID PREVIEW CARD */}
          {validationReport.isValid && validationReport.examPreview && (
            <ClayCard className="p-6 flex flex-col gap-5 border-2 border-solid border-primary-container">
              <div className="text-xs font-black text-outline uppercase tracking-wider border-b border-outline-variant/30 pb-2">Vista previa de la Aventura</div>

              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 bg-primary-fixed/40 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-solid border-primary/10">
                  <MaterialIcon name={subjectIcons[validationReport.examPreview.subject.toLowerCase()] || 'quiz'} className="text-3xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-xl text-on-surface leading-tight truncate">{validationReport.examPreview.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-primary/5 text-primary text-xs font-black px-2.5 py-0.5 rounded-full border border-solid border-primary/10 flex items-center gap-1">
                      <MaterialIcon name="school" className="text-xs" />
                      {validationReport.examPreview.subject}
                    </span>
                    <span className="bg-secondary/5 text-secondary-dark text-xs font-black px-2.5 py-0.5 rounded-full border border-solid border-secondary/10">
                      {validationReport.examPreview.questionCount} preguntas
                    </span>
                    <span className="bg-tertiary-container text-on-tertiary-container text-xs font-black px-2.5 py-0.5 rounded-full border border-solid border-tertiary-container/30">
                      {difficultyLabels[validationReport.examPreview.difficulty] || 'Medio'}
                    </span>
                    <span className="bg-neutral-100 text-outline text-xs font-black px-2.5 py-0.5 rounded-full border border-solid border-outline-variant/30 flex items-center gap-1">
                      <MaterialIcon name="schedule" className="text-xs" />
                      {validationReport.examPreview.estimatedTime} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Display list of question types included */}
              <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2 border border-solid border-outline-variant/30">
                <span className="text-xs font-black text-outline uppercase">Tipos de Pregunta Usados</span>
                <div className="flex flex-wrap gap-1.5">
                  {validationReport.examPreview.questionTypes.map((type, i) => (
                    <span key={i} className="bg-white border border-solid border-outline-variant text-[10px] text-on-surface/80 px-2 py-0.5 rounded-md font-bold">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </ClayCard>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mt-2 justify-center">
            <ChunkyButton
              onClick={handleReset}
              className="px-6 py-2.5 bg-white border-2 border-solid border-outline-variant text-on-surface shadow-[0_4px_0_0_#9ca3af]"
            >
              Cargar otro archivo
            </ChunkyButton>
            
            {validationReport.isValid && (
              <ChunkyButton
                onClick={handleImport}
                className="px-8 py-2.5 bg-primary text-white font-black border-2 border-solid border-primary-dark shadow-[0_4px_0_0_#222fc2]"
              >
                Importar Examen
              </ChunkyButton>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRMATION SUCCESS */}
      {step === 3 && (
        <ClayCard className="p-8 text-center flex flex-col items-center justify-center gap-6 border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg relative overflow-hidden">
          {/* Confetti sparkle animations background */}
          <div className="w-24 h-24 rounded-full bg-emerald-100 border-2 border-solid border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <MaterialIcon name="emoji_events" className="text-5xl font-black" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-emerald-800 mb-1">¡Aventura cargada con éxito!</h2>
            <p className="text-emerald-700 font-bold text-sm">Ya puedes jugar a este examen y competir para ganar estrellas y XP.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <ChunkyButton
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-solid border-outline-variant text-on-surface shadow-[0_4px_0_0_#9ca3af]"
            >
              Cargar otro más
            </ChunkyButton>
            <ChunkyButton
              onClick={() => navigate(`/exam/${importedId}`)}
              className="w-full sm:w-auto px-8 py-2.5 bg-secondary text-on-secondary font-black border-2 border-solid shadow-[0_4px_0_0_#725800]"
            >
              ¡Jugar Aventura!
            </ChunkyButton>
          </div>
        </ClayCard>
      )}
    </div>
  );
};

export default ImportExamPage;
