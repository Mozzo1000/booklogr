import { useQuery } from '@tanstack/react-query'
import BooksService from '../services/books.service'

export function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => BooksService.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}
