
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationParams } from '@/types/quiz';

interface QuizPaginationProps {
  pagination: PaginationParams;
  onPageChange: (page: number) => void;
}

const QuizPagination: React.FC<QuizPaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // If current page is close to the beginning
      if (page <= 3) {
        pageNumbers.push(2, 3, 4, 'ellipsis');
      } 
      // If current page is close to the end
      else if (page >= totalPages - 2) {
        pageNumbers.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1);
      } 
      // If current page is in the middle
      else {
        pageNumbers.push('ellipsis', page - 1, page, page + 1, 'ellipsis');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <Pagination className="my-6">
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page - 1);
              }} 
            />
          </PaginationItem>
        )}

        {getPageNumbers().map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {page < totalPages && (
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default QuizPagination;
