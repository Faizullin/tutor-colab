
export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} /> */}
      <div className="flex-1 overflow-auto">
        <div className="bg-yellow-50 p-4 rounded-lg w-[2500px] h-[100px]">
          <p className="text-yellow-800">
            This is a highlighted section with a yellow background.
          </p>
        </div>
      </div>
    </div>
  );
}
