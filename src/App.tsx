import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Counter from "./features/counter/components/Counter";

const client = new QueryClient();

function App() {
  return (
    <><QueryClientProvider client={client}>
      <Counter />
    </QueryClientProvider>
    </>
  );
}

export default App;
