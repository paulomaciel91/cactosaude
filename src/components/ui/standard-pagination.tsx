import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StandardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string; // Ex: "profissional(is)", "paciente(s)", "item(ns)"
}

export const StandardPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "item(ns)",
}: StandardPaginationProps) => {
  if (totalItems === 0) return null;

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calcular quais páginas mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3; // Número máximo de páginas visíveis ao redor da atual

    if (totalPages <= 7) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostrar primeira página
      pages.push(1);

      let start = Math.max(2, currentPage - maxVisible);
      let end = Math.min(totalPages - 1, currentPage + maxVisible);

      // Ajustar se estamos no início
      if (currentPage <= maxVisible + 1) {
        end = Math.min(5, totalPages - 1);
      }

      // Ajustar se estamos no final
      if (currentPage >= totalPages - maxVisible) {
        start = Math.max(2, totalPages - 4);
      }

      // Adicionar ellipsis antes se necessário
      if (start > 2) {
        pages.push("ellipsis-start");
      }

      // Adicionar páginas do meio
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Adicionar ellipsis depois se necessário
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Sempre mostrar última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {totalItems} {itemLabel}
      </p>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {pageNumbers.map((page, index) => {
              if (typeof page === "string") {
                return (
                  <PaginationItem key={`${page}-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

