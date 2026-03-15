import { FileText } from 'lucide-react';
import { EmptyState } from '../EmptyState';

/**
 * Estado vazio quando não há batch para o período selecionado.
 */
export function SettlementsEmptyState() {
  return (
    <EmptyState
      icon={<FileText />}
      title="Nenhum batch para este período"
      description="Execute o batch do período atual ou selecione outro período."
    />
  );
}
