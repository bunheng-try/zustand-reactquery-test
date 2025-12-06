Below is **the merged, final, clean architecture** of your LMS project, integrating:

### ✔ App Layout components (LeftBar, MainPanel, AppShell)

### ✔ Feature modules (groups, assignments...)

### ✔ Shared/UI components (reusable Shadcn wrappers)

### ✔ Providers pattern (app-level data dependency injection)

### ✔ Zustand (UI state) + React Query (server data)

### ✔ Sequence diagrams (how axios → react query → components → re-renders happen)

Everything is written specifically to help **your developers understand and implement this architecture immediately**, with clarity and simplicity.

---

# 🚀 1. FINAL FOLDER ARCHITECTURE (MERGED)

```
src/
├── app/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── LeftSidebar/
│   │   │   ├── LeftSidebar.tsx
│   │   │   └── LeftSidebarItem.tsx
│   │   └── MainPanel/
│   │       └── MainPanel.tsx
│   │
│   ├── providers/
│   │   ├── QueryProvider.tsx        # ReactQueryClientProvider
│   │   ├── GroupsProvider.tsx       # App-level provider for LeftBar
│   │   └── UIProvider.tsx           # Zustand persist hydration
│   │
│   ├── store/
│   │   ├── ui.store.ts              # global UI store (sidebar toggle)
│   │   └── persist.ts               # persistence helper
│   │
│   └── routes/
│       └── router.tsx
│
├── features/
│   ├── groups/
│   │   ├── api/
│   │   │   ├── requests.ts
│   │   │   └── queries.ts
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── GroupsPage.tsx
│   │   ├── hooks/
│   │   └── store/                   # (optional ui-store)
│   │       └── groupsUI.store.ts
│   │
│   ├── assignments/
│   └── users/
│
├── shared/
│   ├── ui/                          # Shadcn wrappers
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── SidebarLayout.tsx
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── theme/
│
├── assets/
├── main.tsx
└── index.css
```

---

# 🧠 2. CONCEPTUAL OVERVIEW (THE BIG PICTURE)

### **A. APP LAYOUT (global, always displayed)**

* AppShell
* LeftSidebar
* MainPanel

### **B. FEATURES (domain logic)**

* groups
* assignments
* users
* etc.

### **C. SHARED (reusable infra)**

* UI components
* Utils
* Types
* Hooks

### **D. PROVIDERS (dependency injection)**

* React Query
* Zustand persist hydration
* App-level feature providers (GroupsProvider)

---

# 🧩 3. LEFT SIDEBAR + FEATURE DATA (MERGED CONCEPT)

LeftSidebar is **global UI**.
But it *depends* on feature data (groups list).

So we use:
👉 **“App-level Data Provider Pattern”**
(used by Slack, Discord, Notion, Linear)

It avoids coupling global UI with features.

---

# 🏗 4. LAYOUT LAYER (AppShell + LeftSidebar)

### `AppShell.tsx`

```tsx
export function AppShell() {
  return (
    <QueryProvider>
      <UIProvider>
        <GroupsProvider>      
          <div className="flex">
            <LeftSidebar />
            <MainPanel />
          </div>
        </GroupsProvider>
      </UIProvider>
    </QueryProvider>
  );
}
```

### `LeftSidebar.tsx`

```tsx
import { useGroupsContext } from "@/app/providers/GroupsProvider";

export function LeftSidebar() {
  const { data, isLoading } = useGroupsContext();

  if (isLoading) return <div>Loading groups...</div>;

  return (
    <div className="w-60 bg-gray-900 text-white p-2">
      {data?.map(g => (
        <LeftSidebarItem key={g.id} label={g.name} />
      ))}
    </div>
  );
}
```

---

# 🧩 5. PROVIDER LAYER — App-Level Providers

### `GroupsProvider.tsx`

```tsx
const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const query = useGroupsQuery();

  return (
    <GroupsContext.Provider value={query}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroupsContext() {
  return useContext(GroupsContext);
}
```

This ensures:

* LeftSidebar gets group list immediately
* GroupsPage can still use its own useGroupsQuery()
* No circular imports
* No “feature leaking into app layout”

---

# 🧠 6. FEATURE EXAMPLE — GROUPS

### A. Requests (axios layer)

```ts
export const getGroups = async () => {
  const { data } = await axios.get("/groups");
  return data;
};
```

---

### B. React Query hook

```ts
export const useGroupsQuery = () =>
  useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
    staleTime: 1000 * 60,
  });
```

---

### C. Feature page

```tsx
export function GroupsPage() {
  const { data, isLoading } = useGroupsQuery();

  return (
    <div>
      <h1>Groups</h1>
      {isLoading && <Spinner />}
      {data?.map(g => (
        <GroupCard key={g.id} group={g} />
      ))}
    </div>
  );
}
```

---

# 🧠 7. GLOBAL STORE FOR UI STATE

### `ui.store.ts`

```ts
import { create } from "zustand";
import { withPersist } from "./persist";

export const useUIStore = create(
  withPersist("ui", (set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen }))
  }))
);
```

---

### `persist.ts`

```ts
export const withPersist = (name, fn) =>
  persist(fn, {
    name: `lms-${name}`,
    version: 1,
    storage: localStorage,
  });
```

---

# 📊 8. SEQUENCE DIAGRAMS (VERY IMPORTANT)

---

## **1. Feature Page Data Flow**

```
User enters /groups page
    ↓
GroupsPage mounts
    ↓
useGroupsQuery() runs
    ↓
React Query checks cache
    ↓
IF stale:
    → axios.get("/groups")
    → backend returns groups
    → React Query stores in cache
    → React re-renders GroupsPage
```

---

## **2. LeftSidebar Data Flow**

```
AppShell mounts
    ↓
GroupsProvider mounts
    ↓
useGroupsQuery() runs inside provider
    ↓
React Query loads groups
    ↓
LeftSidebar consumes GroupsContext
    ↓
LeftSidebar re-renders with group badges
```

LeftSidebar becomes dynamic without being tied to “features”.

---

## **3. UI Interaction Flow (Sidebar toggle)**

```
User clicks toggle button
    ↓
useUIStore().toggleSidebar()
    ↓
Zustand updates store
    ↓
LeftSidebar re-renders instantly
    ↓
Persist saved in localStorage
```

---

# 🎨 9. SHARED UI COMPONENTS

Example of wrapped Shadcn:

### Button

```tsx
import { Button as ShadButton } from "@/components/ui/button";

export function Button(props) {
  return <ShadButton className="rounded-xl" {...props} />;
}
```

### Badge (for group items):

```tsx
export function Badge({ children }) {
  return (
    <span className="bg-gray-700 text-white px-2 py-1 rounded">
      {children}
    </span>
  );
}
```

---

# 🔥 10. WHY THIS ARCHITECTURE IS THE BEST FOR YOUR LMS

### ✔ Slack-like architecture

Sidebars populated dynamically by domain data.

### ✔ React Query & Zustand separation

Cleanest long-term approach for large front-end apps.

### ✔ App-level providers

Decouples layout from features.

### ✔ Extremely scalable

Add new features without touching AppShell or shared UI.

### ✔ Developer-friendly

Every concept is simple:

* “Providers inject data at the top”
* “Features manage their own logic”
* “Layout components are dumb”

-- 