import Shell from "../components/Shell";
import EntryTable from "../components/EntryTable";
import { api } from "../api/client";

export default function History() {
  return (
    <Shell title="History">
      <EntryTable />
    </Shell>
  );
}
