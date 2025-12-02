import { useQuery } from "@tanstack/react-query";
import { getRandomDog } from "../../../services/api";

export function useDogQuery() {
  return useQuery({
    queryKey: ["dog"],
    queryFn: getRandomDog,
  });
}
