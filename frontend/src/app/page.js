import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function RootPage() {
  const token = cookies().get("jwt");
  if (token) redirect("/dashboard");
  else redirect("/signin");
}
