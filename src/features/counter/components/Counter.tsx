import { useCounterStore } from "../../../store/useCounterStore";
import { useDogQuery } from "../hooks/useQuery";

export default function Counter() {
  const { count, increment } = useCounterStore();
  const { data, isLoading, refetch } = useDogQuery();

  return (
    <div style={{ padding: 20 }}>
      <h2>Zustand Counter</h2>
      <p>Count: {count}</p>
      <button onClick={increment}>Increase</button>

      <hr />

      <h2>React Query Fetch Example</h2>
      {isLoading ? <p>Loading...</p> : <img src={data?.message} width={200} />}
      
      <br />
      <button onClick={() => refetch()}>Get new dog</button>
    </div>
  );
}
