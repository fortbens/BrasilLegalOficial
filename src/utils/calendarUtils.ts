import { Atividade } from '../types';

/**
 * Gera URL direta para adicionar evento ao Google Agenda no navegador
 * Não requer chaves de API nem autenticação prévia - funciona instantaneamente
 */
export function getGoogleCalendarUrl(atividade: Atividade): string {
  const title = encodeURIComponent(`[Brasil Legal] ${atividade.titulo}`);

  // Formato de data YYYYMMDDTHHmm00
  const dataInicioLimpa = atividade.data_inicio.replace(/-/g, '');
  const horaInicioLimpa = (atividade.hora_inicio || '09:00').replace(':', '');
  const startStr = `${dataInicioLimpa}T${horaInicioLimpa}00`;

  let endStr = '';
  if (atividade.data_fim && atividade.hora_fim) {
    const dataFimLimpa = atividade.data_fim.replace(/-/g, '');
    const horaFimLimpa = atividade.hora_fim.replace(':', '');
    endStr = `${dataFimLimpa}T${horaFimLimpa}00`;
  } else {
    // Adiciona 1 hora por padrão
    const [h, m] = (atividade.hora_inicio || '09:00').split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    const endM = String(m || 0).padStart(2, '0');
    endStr = `${dataInicioLimpa}T${endH}${endM}00`;
  }

  // Descrição rica com dados da atividade
  const descLines = [
    atividade.descricao || 'Atividade agendada pela plataforma Brasil Legal Regularização Imobiliária.',
    '',
    `• Tipo: ${atividade.tipo.replace(/_/g, ' ')}`,
    `• Prioridade: ${atividade.prioridade}`,
    `• Status: ${atividade.status.replace(/_/g, ' ')}`,
    atividade.responsavel_nome ? `• Responsável Técnico: ${atividade.responsavel_nome}` : '',
    atividade.cliente_nome ? `• Cliente / Proprietário: ${atividade.cliente_nome}` : '',
    atividade.deal_titulo ? `• Processo Registral: ${atividade.deal_titulo}` : '',
    atividade.link_meet ? `• Link Reunião: ${atividade.link_meet}` : '',
    '',
    '-- Brasil Legal Regularização Imobiliária'
  ].filter(Boolean);

  const details = encodeURIComponent(descLines.join('\n'));
  const location = encodeURIComponent(atividade.local || atividade.link_meet || 'Brasil Legal Regularização Imobiliária');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

/**
 * Retorna o link para abrir a visualização do dia no Google Agenda
 */
export function getGoogleCalendarDayUrl(dataStr?: string): string {
  if (!dataStr) {
    return 'https://calendar.google.com/calendar/r';
  }
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    return `https://calendar.google.com/calendar/r/day/${parts[0]}/${parts[1]}/${parts[2]}`;
  }
  return 'https://calendar.google.com/calendar/r';
}

/**
 * Gera conteúdo no padrão iCalendar (.ics)
 */
export function generateIcsContent(atividade: Atividade): string {
  const dataInicioLimpa = atividade.data_inicio.replace(/-/g, '');
  const horaInicioLimpa = (atividade.hora_inicio || '09:00').replace(':', '');
  const startStr = `${dataInicioLimpa}T${horaInicioLimpa}00`;

  let endStr = '';
  if (atividade.data_fim && atividade.hora_fim) {
    const dataFimLimpa = atividade.data_fim.replace(/-/g, '');
    const horaFimLimpa = atividade.hora_fim.replace(':', '');
    endStr = `${dataFimLimpa}T${horaFimLimpa}00`;
  } else {
    const [h, m] = (atividade.hora_inicio || '09:00').split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    const endM = String(m || 0).padStart(2, '0');
    endStr = `${dataInicioLimpa}T${endH}${endM}00`;
  }

  const escapeIcs = (str: string) => str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Brasil Legal//Modulo Atividades Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:atividade-${atividade.id}@brasillegal.com.br`,
    `DTSTAMP:${startStr}Z`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeIcs(`[Brasil Legal] ${atividade.titulo}`)}`,
    `DESCRIPTION:${escapeIcs(atividade.descricao || 'Atividade da Brasil Legal Regularização Imobiliária')}`,
    `LOCATION:${escapeIcs(atividade.local || atividade.link_meet || 'Brasil Legal')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Faz download do arquivo .ics para importar no Google Agenda, Outlook ou Apple Calendar
 */
export function downloadIcsFile(atividade: Atividade): void {
  const content = generateIcsContent(atividade);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `atividade-${atividade.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
