import { Button } from "@/components/ui/button";

import { useCounterStore } from "../../../store/useCounterStore";
import { useDogQuery } from "../hooks/useQuery";

export default function Counter() {
  const { count, increment } = useCounterStore();
  const { data, isLoading, refetch } = useDogQuery();

  return (
    <div style={{ padding: 20 }}>
      <h2>Zustand Counter</h2>
      <p>Count: {count}</p>
      <Button onClick={increment}>Increase</Button>

      <hr />

      <h2>React Query Fetch Example</h2>
      {isLoading ? <p>Loading...</p> : <img src={data?.message} width={200} />}
      
      <br />
      <Button onClick={() => refetch()}>Get new dog</Button>
    </div>
  );
}
