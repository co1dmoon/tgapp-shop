import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services";

export function useCategoryPrice(id: number) {
    return useQuery<number>({
      queryKey: ['categoryPrice', id],
      queryFn: () => categoryService.getCategoryPrice(id),
    });
  }