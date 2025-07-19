import { TableView } from "./_components/table-view";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
        <TableView />
      </div>
    </div>
  );
}
