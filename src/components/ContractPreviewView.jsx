import React from 'react';
import { PreviewActionBar } from './PreviewActionBar';

const PAGE_H = 1035;
const TOP_SAFE = 228;
const BOTTOM_SAFE = 275;
const CONTENT_H = PAGE_H - TOP_SAFE - BOTTOM_SAFE;
const CLAUSES_PER_PAGE = 10;
const BODY_LINES_PER_PAGE = 14;

const BODY = 'text-[10px] text-gray-800 leading-[1.72] text-justify';
const CLAUSE = `${BODY} mb-2.5 pl-[1.1rem] -indent-[1.1rem]`;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMoney(amount) {
  return `$${(parseFloat(amount) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function parseLines(text) {
  if (!text?.trim()) return [];
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

function chunkLines(text, size) {
  const items = parseLines(text);
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size).join('\n'));
  }
  return chunks.length ? chunks : [''];
}

function isSectionHeader(line) {
  const clean = line.replace(/[:\.]/g, '').trim();
  return clean.length >= 8
    && clean === clean.toUpperCase()
    && !/^\d+[\.\)]/.test(line)
    && !line.startsWith('•')
    && !line.startsWith('-');
}

function isNumberedClause(line) {
  return /^\d+[\.\)]\s/.test(line);
}

function FormalLine({ line, idx }) {
  if (isSectionHeader(line)) {
    return (
      <h5
        key={idx}
        className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-900 text-center mt-3 mb-2 border-b border-gray-200 pb-1"
      >
        {line}
      </h5>
    );
  }
  if (isNumberedClause(line)) {
    return <p key={idx} className={CLAUSE}>{line}</p>;
  }
  if (line.startsWith('•') || line.startsWith('-')) {
    return <p key={idx} className={`${BODY} mb-2 pl-3`}>{line}</p>;
  }
  return <p key={idx} className={`${BODY} mb-2.5`}>{line}</p>;
}

function FormalBody({ text }) {
  const lines = parseLines(text);
  if (!lines.length) return <p className={BODY}>—</p>;
  return <div className="contract-formal-body">{lines.map((line, idx) => <FormalLine key={idx} line={line} idx={idx} />)}</div>;
}

function ContractPage({ folio, date, pageLabel, children }) {
  return (
    <div
      className="contract-page text-black w-[800px] min-w-[800px] shadow-2xl print:shadow-none relative font-sans mx-auto overflow-hidden bg-white shrink-0"
      style={{ height: `${PAGE_H}px` }}
    >
      <img
        src="/hoja.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none print:object-fill"
        aria-hidden="true"
      />
      <div
        className="absolute left-0 right-0 px-10 overflow-hidden"
        style={{ top: TOP_SAFE, height: CONTENT_H }}
      >
        <div className="absolute top-[-80px] right-10 text-right">
          <p className="text-base font-black text-gray-900 tracking-wide">{folio}</p>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mt-1 mb-0.5">Fecha de elaboración</p>
          <p className="text-xs font-semibold text-gray-700">{formatDate(date)}</p>
          {pageLabel && <p className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">{pageLabel}</p>}
        </div>
        <div className="h-full overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children, continuation = false }) {
  return (
    <div className="mb-2">
      <h4 className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-800 mb-1.5 border-b border-[#8ca800]/40 pb-1">
        {continuation ? `${title} (continuación)` : title}
      </h4>
      {typeof children === 'string' ? <FormalBody text={children} /> : children}
    </div>
  );
}

function ClausesBlock({ clauses, continuation = false }) {
  if (!clauses?.trim()) return null;
  return (
    <div>
      <h4 className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-800 mb-2 border-b border-[#8ca800]/40 pb-1">
        {continuation ? 'Cláusulas y condiciones (continuación)' : 'Cláusulas y condiciones'}
      </h4>
      <FormalBody text={clauses} />
    </div>
  );
}

function FormalPreamble({ providerLabel, clientLabel, clientName, date }) {
  return (
    <p className={`${BODY} mb-3 indent-[1.5rem]`}>
      En Bahía de Banderas, Nayarit, con fecha {formatDate(date)},{' '}
      comparecen por una parte{' '}
      <strong className="font-bold">Grupo Solno</strong>, en lo sucesivo &quot;{providerLabel}&quot;, y por la otra{' '}
      <strong className="font-bold">{clientName}</strong>, en lo sucesivo &quot;{clientLabel}&quot;, quienes acuerdan
      celebrar el presente instrumento al tenor de las declaraciones y cláusulas siguientes:
    </p>
  );
}

function SignatureBlock({ leftLabel, leftName, rightLabel, rightName }) {
  return (
    <div className="mt-8">
      <p className={`${BODY} mb-6 indent-[1.5rem]`}>
        Leído que fue el presente contrato y enteradas las partes de su contenido, alcance y fuerza legal,
        lo firman por duplicado en señal de conformidad.
      </p>
      <div className="grid grid-cols-2 gap-10">
        <div className="text-center">
          <div className="border-t border-gray-500 pt-2 mx-2 min-h-[48px]">
            <p className="text-[9px] font-bold text-gray-900">{leftName}</p>
            <p className="text-[8px] text-gray-500 mt-1 uppercase tracking-wide">{leftLabel}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-500 pt-2 mx-2 min-h-[48px]">
            <p className="text-[9px] font-bold text-gray-900">{rightName}</p>
            <p className="text-[8px] text-gray-500 mt-1 uppercase tracking-wide">{rightLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartiesService({ client, clientName }) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1 pb-1 border-b-2 border-[#8ca800]/40">Prestador</h3>
        <p className="font-bold text-xs text-gray-900">Grupo Solno</p>
        <p className="text-[10px] text-gray-600">Mezcales, Bahía de Banderas, Nayarit</p>
        <p className="text-[10px] text-gray-500">contacto@gruposolno.com</p>
      </div>
      <div>
        <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1 pb-1 border-b-2 border-[#8ca800]/40">Cliente</h3>
        {client ? (
          <>
            <p className="font-bold text-xs text-gray-900">{clientName}</p>
            <p className="text-[10px] text-gray-600">{client.company || 'Particular'}</p>
            {client.email && <p className="text-[10px] text-gray-500">{client.email}</p>}
          </>
        ) : (
          <p className="text-xs text-gray-500">Cliente General</p>
        )}
      </div>
    </div>
  );
}

function ServiceContractPages({ contract, client }) {
  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente General';
  const objectChunks = chunkLines(contract.serviceDescription, BODY_LINES_PER_PAGE);
  const clauseChunks = chunkLines(contract.clauses, CLAUSES_PER_PAGE);
  const hasDetailsPage = !!(contract.deliverables || contract.amount || contract.duration);
  const totalPages = 1 + Math.max(0, objectChunks.length - 1) + (hasDetailsPage ? 1 : 0) + clauseChunks.length + 1;
  let pageNum = 1;
  const nextLabel = () => `Página ${pageNum++} de ${totalPages}`;

  return (
    <>
      <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
        <div className="text-center mb-3">
          <h2 className="text-sm font-black uppercase tracking-[0.08em] text-gray-900">Contrato de Prestación de Servicios</h2>
          <p className="text-[10px] font-bold text-[#6d8f00] mt-1">{contract.projectType} — {contract.serviceTitle}</p>
        </div>
        <PartiesService client={client} clientName={clientName} />
        <FormalPreamble providerLabel="EL PRESTADOR" clientLabel="EL CLIENTE" clientName={clientName} date={contract.date} />
        <Section title="Objeto del contrato">{objectChunks[0]}</Section>
      </ContractPage>

      {objectChunks.slice(1).map((chunk, idx) => (
        <ContractPage key={`obj-${idx}`} folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
          <Section title="Objeto del contrato" continuation>{chunk}</Section>
        </ContractPage>
      ))}

      {hasDetailsPage && (
        <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-3">
            Contrato de servicios — {contract.serviceTitle}
          </p>
          {contract.deliverables && <Section title="Entregables">{contract.deliverables}</Section>}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-white/95 border border-gray-200 rounded-md px-4 py-3">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mb-1">Monto acordado</p>
              <p className="text-sm font-black text-gray-900">{formatMoney(contract.amount)} <span className="text-[10px] font-semibold text-gray-600">MXN</span></p>
            </div>
            <div className="bg-white/95 border border-gray-200 rounded-md px-4 py-3">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mb-1">Vigencia / Duración</p>
              <p className="text-sm font-bold text-gray-900">{contract.duration || '—'}</p>
            </div>
          </div>
        </ContractPage>
      )}

      {clauseChunks.map((chunk, idx) => (
        <ContractPage key={`clauses-${idx}`} folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
          <ClausesBlock clauses={chunk} continuation={idx > 0} />
        </ContractPage>
      ))}

      <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-2">Firmas de conformidad</p>
        <SignatureBlock
          leftName="Grupo Solno"
          leftLabel="Prestador del servicio"
          rightName={clientName}
          rightLabel="Contratante"
        />
      </ContractPage>
    </>
  );
}

function CollaboratorContractPages({ contract }) {
  const respChunks = contract.responsibilities ? chunkLines(contract.responsibilities, BODY_LINES_PER_PAGE) : [];
  const clauseChunks = chunkLines(contract.clauses, CLAUSES_PER_PAGE);
  const totalPages = 2 + Math.max(0, respChunks.length - 1) + clauseChunks.length + 1;
  let pageNum = 1;
  const nextLabel = () => `Página ${pageNum++} de ${totalPages}`;

  return (
    <>
      <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
        <div className="text-center mb-3">
          <h2 className="text-sm font-black uppercase tracking-[0.08em] text-gray-900">Contrato de Colaboración</h2>
          <p className="text-[10px] font-bold text-[#6d8f00] mt-1">{contract.collaboratorRole}</p>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1 pb-1 border-b-2 border-[#8ca800]/40">Empresa</h3>
            <p className="font-bold text-xs text-gray-900">Grupo Solno</p>
            <p className="text-[10px] text-gray-600">Mezcales, Bahía de Banderas, Nayarit</p>
          </div>
          <div>
            <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1 pb-1 border-b-2 border-[#8ca800]/40">Colaborador</h3>
            <p className="font-bold text-xs text-gray-900">{contract.collaboratorName}</p>
            <p className="text-[10px] text-gray-600">{contract.collaboratorRole}</p>
            {contract.collaboratorEmail && <p className="text-[10px] text-gray-500">{contract.collaboratorEmail}</p>}
          </div>
        </div>
        <FormalPreamble
          providerLabel="LA EMPRESA"
          clientLabel="EL COLABORADOR"
          clientName={contract.collaboratorName}
          date={contract.date}
        />
        {respChunks[0] && <Section title="Responsabilidades">{respChunks[0]}</Section>}
      </ContractPage>

      {respChunks.slice(1).map((chunk, idx) => (
        <ContractPage key={`resp-${idx}`} folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
          <Section title="Responsabilidades" continuation>{chunk}</Section>
        </ContractPage>
      ))}

      <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/95 border border-gray-200 rounded-md px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mb-1">Compensación</p>
            <p className="text-sm font-black text-gray-900">{formatMoney(contract.compensation)} <span className="text-[10px] font-semibold text-gray-600">MXN</span></p>
            <p className="text-[9px] text-gray-500 mt-0.5">{contract.paymentFrequency || '—'}</p>
          </div>
          <div className="bg-white/95 border border-gray-200 rounded-md px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mb-1">Periodo</p>
            <p className="text-[10px] font-bold text-gray-900">{formatDate(contract.startDate)}</p>
            <p className="text-[9px] text-gray-500 my-0.5">al</p>
            <p className="text-[10px] font-bold text-gray-900">{formatDate(contract.endDate)}</p>
          </div>
        </div>
      </ContractPage>

      {clauseChunks.map((chunk, idx) => (
        <ContractPage key={`clauses-${idx}`} folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
          <ClausesBlock clauses={chunk} continuation={idx > 0} />
        </ContractPage>
      ))}

      <ContractPage folio={contract.folio} date={contract.date} pageLabel={nextLabel()}>
        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-2">Firmas de conformidad</p>
        <SignatureBlock
          leftName="Grupo Solno"
          leftLabel="Empresa contratante"
          rightName={contract.collaboratorName}
          rightLabel="Colaborador"
        />
      </ContractPage>
    </>
  );
}

export function ContractPreviewView({ contract, client, onDownload, onClose }) {
  return (
    <>
      <PreviewActionBar title={contract.folio} onDownload={onDownload} onClose={onClose} />
      <div className="doc-preview-viewport flex justify-center overflow-x-auto pb-4">
        <div className="doc-preview-scale flex flex-col gap-6">
          <div id="contract-document" className="flex flex-col gap-6">
            {contract.category === 'servicio' ? (
              <ServiceContractPages contract={contract} client={client} />
            ) : (
              <CollaboratorContractPages contract={contract} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
