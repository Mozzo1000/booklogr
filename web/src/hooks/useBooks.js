import { useQuery } from '@tanstack/react-query'
import BooksService from '../services/books.service'

export function useBooks({ status, sort, order, page, author }) {
  return useQuery({
    queryKey: ['books', { status, sort, order, page, author }],
    queryFn: () => BooksService.get(status === "" ? undefined : status, sort, order, page, author),
    staleTime: 1000 * 60 * 2,
  })
}
