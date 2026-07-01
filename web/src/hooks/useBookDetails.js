import { useQuery } from '@tanstack/react-query'
import BooksService from '../services/books.service'

export function useBookDetails(isbn) {
  return useQuery({
    queryKey: ['book', isbn],
    queryFn: () => BooksService.get_isbn(isbn),
    staleTime: 1000 * 60 * 10,
  })
}
