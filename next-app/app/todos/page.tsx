import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="py-32 px-6 max-w-4xl mx-auto">
      <h1 className="font-display text-4xl font-extrabold uppercase mb-8">Todos</h1>
      <ul className="space-y-3">
        {todos?.map((todo: any) => (
          <li key={todo.id} className="border border-border p-4 rounded-xl font-light">
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <p className="text-muted-foreground font-light">
            No todos found or table doesn&apos;t exist yet.
          </p>
        )}
      </ul>
    </div>
  );
}
